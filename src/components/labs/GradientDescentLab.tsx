"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { derivative, parse, type MathNode } from "mathjs";

type Point = { x: number; y: number };
type View = { cx: number; cy: number; spanX: number; spanY: number };
const WIDTH = 900;
const HEIGHT = 500;
const LIMIT = 100;
const DEFAULT_VIEW: View = { cx: 0, cy: 0, spanX: 12, spanY: 12 };
const PRESETS = [
  { label: "Parabola", expression: "x^2" },
  { label: "Cubic", expression: "x^3" },
  { label: "Double well", expression: "x^4 - 3*x^2" },
  { label: "Wave", expression: "sin(x) + x^2/5" },
];

const OPERATORS = new Set(["+", "-", "*", "/", "^", "unaryMinus", "unaryPlus"]);
const FUNCS = new Set(["sin", "cos", "tan", "exp", "log", "sqrt", "abs"]);
const SYMBOLS = new Set(["x", "pi", "e"]);

function createFunction(expression: string) {
  if (!expression.trim() || expression.length > 150) throw new Error("Enter a formula (up to 150 characters).");
  const node = parse(expression);
  node.traverse((part: any, _path: string, parent: any) => {
    if (part.isParenthesisNode || part.isConstantNode) return;
    if (part.isOperatorNode) {
      if (!OPERATORS.has(part.op)) throw new Error("Unsupported operator.");
      return;
    }
    if (part.isFunctionNode) {
      if (!part.fn.isSymbolNode || !FUNCS.has(part.fn.name)) throw new Error("Unsupported function.");
      return;
    }
    if (part.isSymbolNode) {
      if (parent?.isFunctionNode && parent.fn === part && FUNCS.has(part.name)) return;
      if (!SYMBOLS.has(part.name)) throw new Error(`Unknown variable: ${part.name}`);
      return;
    }
    throw new Error("Unsupported expression. Use arithmetic and standard functions of x.");
  });
  const f = node.compile();
  const dNode = derivative(node, "x");
  const d = dNode.compile();
  const evalNumber = (compiled: ReturnType<MathNode["compile"]>, x: number) => {
    try {
      const value: unknown = compiled.evaluate({ x });
      return typeof value === "number" && Number.isFinite(value) ? value : NaN;
    } catch {
      return NaN;
    }
  };
  return { f: (x: number) => evalNumber(f, x), df: (x: number) => evalNumber(d, x), derivative: dNode.toString() };
}

function tickSpacing(span: number) {
  const target = span / 10;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const ratio = target / magnitude;
  return (ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 5 ? 5 : 10) * magnitude;
}
function ticks(center: number, span: number) {
  const step = tickSpacing(span);
  const min = center - span / 2;
  const max = center + span / 2;
  const first = Math.ceil(min / step);
  const last = Math.floor(max / step);
  return Array.from({ length: Math.min(100, Math.max(0, last - first + 1)) }, (_, i) => (first + i) * step);
}
function fmt(x: number) {
  if (!Number.isFinite(x)) return "undefined";
  if (Math.abs(x) > 1e7 || (Math.abs(x) < 0.0001 && x !== 0)) return x.toExponential(3);
  return Number(x.toFixed(4)).toString();
}

export default function GradientDescentLab() {
  const clipId = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ px: number; py: number; view: View; moved: boolean; mode: "pan" | "point" } | null>(null);
  const animationRef = useRef<number | null>(null);
  const displayedXRef = useRef(3);
  const [displayedX, setDisplayedX] = useState(3);
  const [animating, setAnimating] = useState(false);
  const [dragging, setDragging] = useState<"pan" | "point" | null>(null);
  const [expression, setExpression] = useState("x^2");
  const [learningRate, setLearningRate] = useState(0.2);
  const [startingX, setStartingX] = useState(3);
  // Preserve intermediate text like "", "-", "2.", and "-." while editing.
  const [startingXInput, setStartingXInput] = useState("3");
  const [history, setHistory] = useState<number[]>([3]);
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [hover, setHover] = useState<Point | null>(null);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [showTangent, setShowTangent] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [error, setError] = useState("");

  // The parsed function is derived directly from the textbox on every React render.
  const parsed = useMemo(() => {
    try { return { math: createFunction(expression), message: "" }; }
    catch (err) { return { math: null, message: err instanceof Error ? err.message : "Invalid expression" }; }
  }, [expression]);
  const math = parsed.math;
  const currentX = history[history.length - 1];
  const currentY = math?.f(displayedX) ?? NaN;
  const slope = math?.df(displayedX) ?? NaN;

  // Stop in-flight animations on unmount to avoid stale animation frames.
  useEffect(() => () => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
  }, []);

  function stopAnimation(x: number) {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    displayedXRef.current = x;
    setDisplayedX(x);
    setAnimating(false);
  }

  const toX = (x: number) => WIDTH * (0.5 + (x - view.cx) / view.spanX);
  const toY = (y: number) => HEIGHT * (0.5 - (y - view.cy) / view.spanY);
  const fromX = (px: number) => view.cx + (px / WIDTH - 0.5) * view.spanX;
  const fromY = (py: number) => view.cy - (py / HEIGHT - 0.5) * view.spanY;

  const curve = useMemo(() => {
    if (!math) return "";
    let d = "";
    let connected = false;
    let previousY = NaN;
    for (let i = 0; i <= WIDTH; i += 2) {
      const x = fromX(i);
      const y = math.f(x);
      const inRange = Number.isFinite(y) && Math.abs(y - view.cy) < view.spanY * 3;
      // Avoid connecting across big jumps/asymptotes.
      if (!inRange || (Number.isFinite(previousY) && Math.abs(y - previousY) > view.spanY)) {
        connected = false;
        previousY = inRange ? y : NaN;
        continue;
      }
      d += `${connected ? "L" : "M"}${i},${toY(y).toFixed(2)} `;
      connected = true;
      previousY = y;
    }
    return d;
  }, [math, view]);

  const clientPoint = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const px = (clientX - rect.left) * WIDTH / rect.width;
    const py = (clientY - rect.top) * HEIGHT / rect.height;
    return { px, py, x: fromX(px), y: fromY(py) };
  };

  function resetSteps(x = startingX) {
    stopAnimation(x);
    setHistory([x]);
    setError("");
  }
  function updateExpression(value: string) {
    setExpression(value);
    resetSteps();
  }
  function updateStart(x: number, syncInput = true) {
    if (!Number.isFinite(x) || Math.abs(x) > 1e7) return;
    setStartingX(x);
    if (syncInput) setStartingXInput(String(x));
    resetSteps(x);
  }
  function editStartingX(raw: string) {
    // Text inputs allow clearing and partially typing a number unlike type="number".
    setStartingXInput(raw);
    const trimmed = raw.trim();
    if (!trimmed || !/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return;
    const value = Number(trimmed);
    if (Number.isFinite(value) && Math.abs(value) <= 1e7) {
      updateStart(value, false);
    }
  }
  function nextStep() {
    if (!math || animating || history.length > LIMIT || error) return;
    const g = math.df(currentX);
    if (!Number.isFinite(g)) { setError("Derivative is undefined at this position."); return; }
    const next = currentX - learningRate * g;
    if (!Number.isFinite(next) || Math.abs(next) > 1e10 || !Number.isFinite(math.f(next))) {
      setError("Next iteration is undefined or diverged. Try a smaller learning rate.");
      return;
    }
    // Ease between iterations. The tangent follows the moving point.
    const from = currentX;
    const started = performance.now();
    const duration = 650;
    setAnimating(true);
    const frame = (time: number) => {
      const t = Math.min(1, (time - started) / duration);
      const eased = t * t * (3 - 2 * t); // smoothstep
      const x = from + (next - from) * eased;
      displayedXRef.current = x;
      setDisplayedX(x);
      if (t < 1) {
        animationRef.current = requestAnimationFrame(frame);
      } else {
        animationRef.current = null;
        setAnimating(false);
        setHistory(previous => [...previous, next]);
      }
    };
    animationRef.current = requestAnimationFrame(frame);
  }
  function zoomAt(factor: number, px = WIDTH / 2, py = HEIGHT / 2) {
    setView(old => {
      const spanX = Math.max(0.01, Math.min(1e5, old.spanX * factor));
      const spanY = Math.max(0.01, Math.min(1e5, old.spanY * factor));
      const x = old.cx + (px / WIDTH - 0.5) * old.spanX;
      const y = old.cy - (py / HEIGHT - 0.5) * old.spanY;
      return { cx: x - (px / WIDTH - 0.5) * spanX, cy: y + (py / HEIGHT - 0.5) * spanY, spanX, spanY };
    });
  }
  function onWheel(event: WheelEvent<SVGSVGElement>) {
    event.preventDefault();
    const point = clientPoint(event.clientX, event.clientY);
    if (point) zoomAt(event.deltaY > 0 ? 1.13 : 1 / 1.13, point.px, point.py);
  }
  function pointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || animating) return;
    const target = event.target;
    const pointTarget = target instanceof Element && !!target.closest('[data-optimization-point="true"]');
    const mode = pointTarget ? "point" : "pan";
    dragRef.current = { px: event.clientX, py: event.clientY, view, moved: false, mode };
    setDragging(mode);
    if (mode === "point") {
      // Start a new run when the current point is dragged.
      const point = clientPoint(event.clientX, event.clientY);
      if (point) updateStart(Number(point.x.toFixed(4)));
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<SVGSVGElement>) {
    const point = clientPoint(event.clientX, event.clientY);
    if (point && math) {
      const y = math.f(point.x);
      setHover(Number.isFinite(y) ? { x: point.x, y } : null);
    }
    if (!dragRef.current) {
      if (math && point) {
        const near = history.map((x, i) => ({ x, y: math.f(x), i }))
          .filter(p => Number.isFinite(p.y))
          .find(p => Math.hypot(toX(p.x) - point.px, toY(p.y) - point.py) < 13);
        setHoverStep(near ? near.i : null);
      }
      return;
    }
    const drag = dragRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - drag.px) / rect.width * WIDTH;
    const dy = (event.clientY - drag.py) / rect.height * HEIGHT;
    if (Math.hypot(dx, dy) > 4) drag.moved = true;
    if (drag.mode === "point" && point) {
      updateStart(Number(point.x.toFixed(4)));
      setHoverStep(0);
      return;
    }
    if (drag.moved) {
      setView({ ...drag.view,
        cx: drag.view.cx - dx / WIDTH * drag.view.spanX,
        cy: drag.view.cy + dy / HEIGHT * drag.view.spanY,
      });
    }
  }
  function pointerUp(event: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragging(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag && drag.mode === "pan" && !drag.moved) {
      const point = clientPoint(event.clientX, event.clientY);
      if (point) updateStart(Number(point.x.toFixed(3)));
    }
  }
  const pathPoints = math ? history.map(x => ({ x, y: math.f(x) })).filter(p => Number.isFinite(p.y)) : [];
  const tangent = Number.isFinite(currentY) && Number.isFinite(slope) ? [displayedX - view.spanX / 5, displayedX + view.spanX / 5].map(x => `${toX(x)},${toY(currentY + slope * (x - displayedX))}`).join(" ") : "";
  const activePoint = math && Number.isFinite(currentY) ? { x: displayedX, y: currentY } : null;
  const hoverPoint = hoverStep !== null && math && history[hoverStep] !== undefined
    ? { x: history[hoverStep], y: math.f(history[hoverStep]) } : hover;
  const tooltipPosition = hoverPoint && Number.isFinite(hoverPoint.y) ? {
    left: `${Math.max(8, Math.min(WIDTH - 135, toX(hoverPoint.x) + 13)) / WIDTH * 100}%`,
    top: `${Math.max(8, Math.min(HEIGHT - 77, toY(hoverPoint.y) - 75)) / HEIGHT * 100}%`,
  } : null;
  const xTicks = ticks(view.cx, view.spanX);
  const yTicks = ticks(view.cy, view.spanY);
  const axisX = toX(0);
  const axisY = toY(0);
  return (
    <section className="gd-compact javs-gd my-10 overflow-hidden rounded-2xl border border-slate-700 bg-[#0b1220] text-slate-100 shadow-2xl">
      <header className="gd-header border-b border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Jav's Lab / Interactive Experiment</p>
        <h2 className="mt-2 text-2xl font-bold">Gradient Descent Playground</h2>
        <p className="mt-1 text-sm text-slate-400">Type a function, then step through the optimization.</p>
      </header>
      <div className="gd-content space-y-5 p-4 md:p-6">
        <div className="gd-expression">
          <label htmlFor="gd-expression" className="mb-2 block text-sm font-semibold">Function f(x)</label>
          <input id="gd-expression" type="text" autoComplete="off" spellCheck={false} value={expression}
            onChange={event => updateExpression(event.target.value)} placeholder="Try x^3 or sin(x) + x^2/5"
            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 font-mono text-lg text-blue-300 outline-none focus:border-blue-400" />
          {parsed.message ? <p role="alert" className="mt-2 text-sm text-amber-400">{parsed.message}</p> :
            <p className="mt-2 text-xs text-slate-400">f'(x) = <span className="font-mono text-emerald-400">{math?.derivative}</span></p>}
          <div className="gd-expression-presets mt-3 flex flex-wrap gap-2">
            {PRESETS.map(p => <button type="button" key={p.label} onClick={() => updateExpression(p.expression)}
              className="cursor-pointer rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs hover:border-blue-500">{p.label}</button>)}
          </div>
        </div>

        <div className="gd-chart overflow-hidden rounded-xl border border-slate-700 bg-[#080e1a]">
          <div className="gd-chart-toolbar flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-3">
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="text-blue-400">● Function</span>
              <span className="text-amber-400">● Steps</span>
              <span className="text-emerald-400">● Tangent</span>
            </div>
            <div className="flex gap-2 text-sm">
              <button onClick={() => zoomAt(1 / 1.4)} className="cursor-pointer rounded bg-slate-800 px-3 py-1 hover:bg-slate-700" aria-label="Zoom in">+</button>
              <button onClick={() => zoomAt(1.4)} className="cursor-pointer rounded bg-slate-800 px-3 py-1 hover:bg-slate-700" aria-label="Zoom out">−</button>
              <button onClick={() => setView(DEFAULT_VIEW)} className="cursor-pointer rounded bg-slate-800 px-3 py-1 hover:bg-slate-700">Reset view</button>
            </div>
          </div>
          <div className="relative">
            <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={`w-full select-none touch-none ${dragging === "pan" ? "cursor-grabbing" : dragging === "point" ? "cursor-grabbing" : hoverStep !== null ? "cursor-grab" : "cursor-crosshair"}`}
              onWheel={onWheel} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}
              onPointerCancel={() => { dragRef.current = null; setDragging(null); }} onPointerLeave={() => { setHover(null); setHoverStep(null); }}
              aria-label="Interactive function plot; click to select a starting x, drag to pan, scroll to zoom">
              <defs><clipPath id={clipId}><rect width={WIDTH} height={HEIGHT}/></clipPath></defs>
              {xTicks.map(x => <g key={`x${x}`}><line x1={toX(x)} x2={toX(x)} y1={0} y2={HEIGHT} stroke="#334155" strokeOpacity=".48"/>
                <text x={toX(x)+4} y={Math.max(15,Math.min(HEIGHT-8,axisY+16))} fill="#94a3b8" fontSize="11">{fmt(x)}</text></g>)}
              {yTicks.map(y => <g key={`y${y}`}><line x1={0} x2={WIDTH} y1={toY(y)} y2={toY(y)} stroke="#334155" strokeOpacity=".48"/>
                <text x={Math.max(6,Math.min(WIDTH-38,axisX+7))} y={toY(y)-5} fill="#94a3b8" fontSize="11">{fmt(y)}</text></g>)}
              <line x1={axisX} x2={axisX} y1={0} y2={HEIGHT} stroke="#a4b4c9" strokeWidth="1.5" />
              <line x1={0} x2={WIDTH} y1={axisY} y2={axisY} stroke="#a4b4c9" strokeWidth="1.5" />
              <g clipPath={`url(#${clipId})`}>
                <path d={curve} stroke="#60a5fa" strokeWidth={3} fill="none" />
                {showTangent && tangent && <polyline points={tangent} stroke="#34d399" strokeWidth={3} strokeDasharray="9 5" fill="none" />}
                {showHistory && pathPoints.length > 1 && <polyline points={pathPoints.map(p => `${toX(p.x)},${toY(p.y)}`).join(" ")}
                  stroke="#f59e0b" strokeWidth={2.5} fill="none" strokeDasharray="5 5" />}
                {showHistory && pathPoints.slice(0, -1).map((p, index) => <circle key={index} cx={toX(p.x)} cy={toY(p.y)} r={5}
                  fill="#f59e0b" stroke="#080e1a" strokeWidth={1}
                  onPointerEnter={() => setHoverStep(index)} />)}
                {activePoint && <circle data-optimization-point="true" cx={toX(activePoint.x)} cy={toY(activePoint.y)} r={9}
                  fill="#f59e0b" stroke="white" strokeWidth={2.5} className="cursor-grab"
                  onPointerEnter={() => setHoverStep(history.length - 1)} />}
                {hover && <g pointerEvents="none"><line x1={toX(hover.x)} x2={toX(hover.x)} y1={toY(hover.y)} y2={axisY} stroke="#94a3b8" strokeDasharray="3 4"/>
                  <circle cx={toX(hover.x)} cy={toY(hover.y)} r={5} fill="#60a5fa" stroke="#fff" strokeWidth={1.5}/></g>}
              </g>
              <text x={WIDTH-20} y={Math.max(20,Math.min(HEIGHT-8,axisY-10))} fill="#cbd5e1">x</text>
              <text x={Math.max(8,Math.min(WIDTH-20,axisX+9))} y="20" fill="#cbd5e1">y</text>
            </svg>
            {hoverPoint && tooltipPosition && <div style={tooltipPosition} className="pointer-events-none absolute z-10 rounded-lg border border-slate-600 bg-slate-950/95 px-3 py-2 font-mono text-xs shadow-lg">
              <p className="text-slate-400">{hoverStep !== null ? `Iteration ${hoverStep}` : "On function"}</p>
              <p>x: <span className="text-blue-300">{fmt(hoverPoint.x)}</span></p>
              <p>y: <span className="text-blue-300">{fmt(hoverPoint.y)}</span></p>
            </div>}
          </div>
          <p className="gd-chart-help border-t border-slate-800 px-3 py-2 text-xs text-slate-400">Hover for coordinates · Drag the orange point to restart · Click to set start · Drag background to pan · Scroll to zoom</p>
        </div>

        <div className="gd-params grid gap-4 md:grid-cols-2">
          <label className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm">
            <span className="flex justify-between"><span>Learning rate (α)</span><span className="font-mono text-blue-400">{learningRate.toFixed(2)}</span></span>
            <input type="range" min="0.01" max="1.5" step="0.01" value={learningRate} onChange={event => { setLearningRate(Number(event.target.value)); resetSteps(); }} className="mt-4 w-full cursor-pointer accent-blue-500" />
          </label>
          <label className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm">
            <span className="block">Starting X (x₀)</span>
            <input type="text" inputMode="decimal" autoComplete="off" spellCheck={false}
              aria-label="Starting X coordinate" value={startingXInput}
              onChange={event => editStartingX(event.target.value)}
              onBlur={() => setStartingXInput(String(startingX))}
              className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-500" />
          </label>
        </div>
        <div className="gd-metrics grid grid-cols-2 gap-3 md:grid-cols-4">
          {[["Iteration", String(history.length-1)],["Current X",fmt(displayedX)],["Loss f(x)",fmt(currentY)],["Gradient f'(x)",fmt(slope)]].map(([label,value]) =>
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 break-all font-mono text-lg font-semibold">{value}</p></div>)}
        </div>
        <div className="gd-equation rounded-xl border border-blue-900 bg-blue-950/20 p-4 text-sm">
          <p className="font-medium text-blue-300">Update: x(next) = x − α × f'(x)</p>
          {math && Number.isFinite(slope) && <p className="mt-2 font-mono text-slate-300">{fmt(displayedX)} − {fmt(learningRate)} × ({fmt(slope)}) = {fmt(displayedX-learningRate*slope)}</p>}
          {history.length > 1 && Number.isFinite(slope) && Math.abs(slope)<0.0001 && <p className="mt-2 text-emerald-300">Gradient is approximately zero (stationary point; not necessarily a minimum).</p>}
        </div>
        <div className="gd-visibility flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={showTangent} onChange={event => setShowTangent(event.target.checked)}/> Show tangent</label>
          <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={showHistory} onChange={event => setShowHistory(event.target.checked)}/> Show steps</label>
        </div>
        {error && <p role="alert" className="gd-error text-sm text-red-400">{error}</p>}
        <div className="gd-actions flex flex-wrap gap-3">
          <button type="button" disabled={!math || !!error || animating || history.length > LIMIT} onClick={nextStep} data-javs-primary="true"
            className="min-w-36 flex-1 cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{animating ? "Moving…" : "Next iteration →"}</button>
          <button type="button" disabled={history.length<2 || animating} onClick={() => { const previous = history[history.length-2]; stopAnimation(previous); setHistory(h => h.slice(0,-1)); setError(""); }} className="cursor-pointer rounded-xl border border-slate-700 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-40">Undo</button>
          <button type="button" onClick={() => resetSteps()} className="cursor-pointer rounded-xl border border-slate-700 px-5 py-3">Reset steps</button>
        </div>
        {math && history.length>1 && <details className="gd-history rounded-xl border border-slate-800 p-4"><summary className="cursor-pointer font-medium">Iteration history ({history.length-1} steps)</summary>
          <div className="mt-3 max-h-64 overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="text-slate-400"><th>Step</th><th>X</th><th>f(x)</th><th>f'(x)</th></tr></thead><tbody>
            {history.map((x,i) => <tr key={i} className="border-t border-slate-800"><td className="py-2">{i}</td><td>{fmt(x)}</td><td>{fmt(math.f(x))}</td><td>{fmt(math.df(x))}</td></tr>)}
          </tbody></table></div></details>}
      </div>
    </section>
  );
}
