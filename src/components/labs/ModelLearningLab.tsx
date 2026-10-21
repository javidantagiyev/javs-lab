"use client";

import { useEffect, useId, useMemo, useState, type MouseEvent } from "react";
import {
  gradientStep, INITIAL_MODEL, isSafeModel, mse, predict, rmse,
  START_RATE, TRAINING_SAMPLES, UNSEEN_SAMPLES,
  type ModelParameters,
} from "./model-learning-core";
import "./model-learning-lab.css";

const GOLD = "#e1bb80";
const TEAL = "#9dcbb7";
const PLOT = { width: 490, height: 265, left: 39, top: 14, right: 16, bottom: 36 };
const chartWidth = PLOT.width - PLOT.left - PLOT.right;
const chartHeight = PLOT.height - PLOT.top - PLOT.bottom;
const px = (x: number) => PLOT.left + (x / 10) * chartWidth;
const py = (y: number) => PLOT.top + ((110 - y) / 110) * chartHeight;
const limit = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const nice = (value: number, digits = 1) => Number.isFinite(value) ? value.toFixed(digits) : "—";

type LabState = { model: ModelParameters; iteration: number; losses: number[]; diverged: boolean };
function firstState(): LabState {
  return { model: { ...INITIAL_MODEL }, iteration: 0, losses: [mse(INITIAL_MODEL, TRAINING_SAMPLES)], diverged: false };
}
function nextState(previous: LabState, rate: number): LabState {
  if (previous.diverged) return previous;
  const updated = gradientStep(previous.model, rate);
  if (!isSafeModel(updated)) return { ...previous, diverged: true };
  const loss = mse(updated, TRAINING_SAMPLES);
  if (!Number.isFinite(loss) || loss > 1e11) return { ...previous, diverged: true };
  return {
    model: updated,
    iteration: previous.iteration + 1,
    losses: [...previous.losses.slice(-119), loss],
    diverged: false,
  };
}

export default function ModelLearningLab() {
  const clipId = useId().replace(/:/g, "");
  const [state, setState] = useState<LabState>(firstState);
  const [rate, setRate] = useState(START_RATE);
  const [stepsLeft, setStepsLeft] = useState(0);
  const [queryHours, setQueryHours] = useState(5);
  const [showErrors, setShowErrors] = useState(true);
  const [showUnseen, setShowUnseen] = useState(true);
  const trainingLoss = useMemo(() => mse(state.model, TRAINING_SAMPLES), [state.model]);
  const holdoutLoss = useMemo(() => rmse(state.model, UNSEEN_SAMPLES), [state.model]);
  const learning = stepsLeft > 0;

  useEffect(() => {
    if (stepsLeft <= 0 || state.diverged) return;
    const timer = setTimeout(() => {
      setState(old => nextState(old, rate));
      setStepsLeft(old => Math.max(0, old - 1));
    }, 70);
    return () => clearTimeout(timer);
  }, [stepsLeft, state, rate]);

  function manualChange(field: keyof ModelParameters, value: number) {
    if (!Number.isFinite(value)) return;
    setStepsLeft(0);
    setState(old => {
      const updated = { ...old.model, [field]: value };
      return { model: updated, iteration: 0, losses: [mse(updated, TRAINING_SAMPLES)], diverged: false };
    });
  }
  function changeRate(newRate: number) {
    setStepsLeft(0);
    setRate(newRate);
  }
  function step() { if (!learning && !state.diverged) setState(old => nextState(old, rate)); }
  function run(count: number) { if (!learning && !state.diverged) setStepsLeft(count); }
  function reset() { setStepsLeft(0); setState(firstState()); setRate(START_RATE); setQueryHours(5); setShowErrors(true); setShowUnseen(true); }
  function chartClick(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width * PLOT.width;
    setQueryHours(Number(limit((position - PLOT.left) / chartWidth * 10, 0, 10).toFixed(1)));
  }
  const line = `M ${px(0)} ${py(predict(state.model, 0))} L ${px(10)} ${py(predict(state.model, 10))}`;
  const predicted = predict(state.model, queryHours);
  const lossFloor = Math.min(...state.losses);
  const lossCeil = Math.max(...state.losses);
  const lossPath = state.losses.map((loss, index) => {
    const x = 7 + (index / Math.max(1, state.losses.length - 1)) * 226;
    const fraction = lossCeil === lossFloor ? 0.5 : (loss - lossFloor) / (lossCeil - lossFloor);
    return `${index ? "L" : "M"} ${x.toFixed(2)} ${(46 - fraction * 35).toFixed(2)}`;
  }).join(" ");

  return (
    <section className="jml4-lab" aria-label="How a model learns: interactive linear training lab">
      <header className="jml4-header">
        <div>
          <span className="jml4-overline">MODEL TRAINING / EXPERIMENT 004</span>
          <h3>Can a line learn<span>?</span></h3>
        </div>
        <span className="jml4-live"><i aria-hidden="true"/> RUNS IN YOUR BROWSER</span>
      </header>
      <div className="jml4-equation" aria-label="Model equation">
        <span>MODEL</span>
        <strong>prediction = <em>intercept</em> + <em>slope</em> × hours</strong>
        <small>ŷ = {nice(state.model.intercept)} {state.model.slope >= 0 ? "+" : "−"} {nice(Math.abs(state.model.slope))}x</small>
      </div>
      <div className="jml4-body">
        <div className="jml4-graph-area">
          <div className="jml4-panel-label"><span>01 / HOW WELL DOES THE LINE FIT?</span><small>CLICK THE PLOT TO TEST A NEW INPUT</small></div>
          <svg className="jml4-chart" viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img"
            aria-label={`Study hours versus practice scores. Eight training observations, a model line, and ${showUnseen ? "three" : "no"} unseen observations. Click to select a new study duration.`}
            onClick={chartClick}>
            <defs><clipPath id={clipId}><rect x={PLOT.left} y={PLOT.top} width={chartWidth} height={chartHeight}/></clipPath></defs>
            <rect x={PLOT.left} y={PLOT.top} width={chartWidth} height={chartHeight} fill="#111510" stroke="#464537"/>
            {[0,2,4,6,8,10].map(x => <g key={`x-${x}`}>
              <line x1={px(x)} x2={px(x)} y1={PLOT.top} y2={PLOT.top+chartHeight} stroke="#34392e" strokeWidth=".8"/>
              <text x={px(x)} y={PLOT.height-19} textAnchor="middle" fill="#a39f93" fontSize="10">{x}</text>
            </g>)}
            {[0,25,50,75,100].map(y => <g key={`y-${y}`}>
              <line x1={PLOT.left} x2={PLOT.left+chartWidth} y1={py(y)} y2={py(y)} stroke="#34392e" strokeWidth=".8"/>
              <text x={PLOT.left-8} y={py(y)+4} textAnchor="end" fill="#a39f93" fontSize="10">{y}</text>
            </g>)}
            <g clipPath={`url(#${clipId})`}>
              {showErrors && TRAINING_SAMPLES.map((row, i) => <line key={`error-${i}`} x1={px(row.hours)} x2={px(row.hours)} y1={py(row.score)} y2={py(predict(state.model,row.hours))} stroke="#d6a76d" strokeWidth="1.3" opacity=".55" strokeDasharray="3 3"/>)}
              {showUnseen && UNSEEN_SAMPLES.map((row, i) => <circle key={`unseen-${i}`} cx={px(row.hours)} cy={py(row.score)} r="5.5" fill="#111510" stroke={TEAL} strokeWidth="1.8"><title>{`Unseen observation: ${row.hours} hours, ${row.score} score`}</title></circle>)}
              <path d={line} stroke={GOLD} strokeWidth="2.8" fill="none" strokeLinecap="round"/>
              <line x1={px(queryHours)} x2={px(queryHours)} y1={PLOT.top} y2={PLOT.top+chartHeight} stroke="#b5af9e" strokeDasharray="4 4" opacity=".6"/>
              <circle cx={px(queryHours)} cy={py(predicted)} r="6" fill={GOLD} stroke="#151813" strokeWidth="2"><title>{`Model predicts ${nice(predicted)} points for ${queryHours} hours`}</title></circle>
              {TRAINING_SAMPLES.map((row, i) => <circle key={`train-${i}`} cx={px(row.hours)} cy={py(row.score)} r="5" fill="#e6c28e" stroke="#171915" strokeWidth="1.7"><title>{`Training sample: ${row.hours} hours, score ${row.score}`}</title></circle>)}
            </g>
            <text x={PLOT.left+5} y={PLOT.top+14} fill="#b5a58a" fontSize="10">↑ Practice score</text>
            <text x={PLOT.width-14} y={PLOT.height-7} textAnchor="end" fill="#b5a58a" fontSize="10">Study hours →</text>
          </svg>
          <div className="jml4-legend">
            <span><i className="jml4-dot-gold"/> Training data</span>
            <span><i className="jml4-dot-teal"/> Unseen examples</span>
            <span><i className="jml4-line-gold"/> Model prediction</span>
          </div>
          <div className="jml4-graph-toggles">
            <label><input type="checkbox" checked={showErrors} onChange={event=>setShowErrors(event.target.checked)}/> Show prediction errors</label>
            <label><input type="checkbox" checked={showUnseen} onChange={event=>setShowUnseen(event.target.checked)}/> Show unseen examples</label>
          </div>
        </div>
        <div className="jml4-control-area">
          <div className="jml4-panel-label"><span>02 / ADJUST AND TRAIN</span><small>{learning ? "LEARNING…" : "READY"}</small></div>
          <label className="jml4-range"><span>Intercept <b>{nice(state.model.intercept)} pts</b></span><input type="range" min="-20" max="100" step="1" value={limit(state.model.intercept,-20,100)} disabled={learning} onChange={event=>manualChange("intercept",Number(event.target.value))}/><small>Starting height of the prediction line</small></label>
          <label className="jml4-range"><span>Slope <b>{nice(state.model.slope)} pts/h</b></span><input type="range" min="-8" max="18" step="0.2" value={limit(state.model.slope,-8,18)} disabled={learning} onChange={event=>manualChange("slope",Number(event.target.value))}/><small>Change in prediction per extra hour</small></label>
          <label className="jml4-range jml4-rate"><span>Learning rate <b>{nice(rate,2)}</b></span><input type="range" min="0.01" max="1.25" step="0.01" value={rate} disabled={learning} onChange={event=>changeRate(Number(event.target.value))}/><small>Size of each training update (normalized units)</small></label>
          <div className="jml4-actions">
            <button type="button" className="jml4-primary" onClick={step} disabled={learning||state.diverged}>One step →</button>
            <button type="button" onClick={()=>run(50)} disabled={learning||state.diverged}>{learning?`Training (${stepsLeft})` : "Train 50 ↗"}</button>
            <button type="button" className="jml4-reset" onClick={reset}>Reset ↺</button>
          </div>
          {state.diverged ? <p className="jml4-warning" role="status">The model diverged. Reduce the learning rate and reset the experiment.</p>
            : <p className="jml4-tip" role="status">{learning?`Optimizing the model · ${stepsLeft} steps left` : state.iteration===0?"Adjust the line by hand, or let gradient descent update it.":`Completed ${state.iteration} update${state.iteration===1?"":"s"}. Check how the line and error changed.`}</p>}
        </div>
      </div>
      <div className="jml4-metrics" aria-live="off">
        <div><small>TRAINING ITERATIONS</small><strong>{state.iteration}</strong></div>
        <div><small>TRAINING ERROR (RMSE)</small><strong>{nice(Math.sqrt(trainingLoss))}<span> pts</span></strong></div>
        <div><small>UNSEEN ERROR (RMSE)</small><strong>{nice(holdoutLoss)}<span> pts</span></strong></div>
        <div><small>PREDICTION AT {nice(queryHours)} H</small><strong>{nice(predicted)}<span> pts</span></strong></div>
      </div>
      <div className="jml4-analysis">
        <div className="jml4-loss-inline"><span>LOSS HISTORY / TRAINING MSE</span><svg viewBox="0 0 240 55" role="img" aria-label={`Training mean squared error from ${nice(state.losses[0])} to ${nice(state.losses[state.losses.length-1])}`}><rect x="1" y="1" width="238" height="52" rx="3" fill="#141712" stroke="#38392e"/><path d={lossPath} fill="none" stroke="#dfb781" strokeWidth="2" strokeLinecap="round"/></svg></div>
        <label className="jml4-prediction"><span>TEST A DIFFERENT INPUT</span><span>Study hours <strong>{nice(queryHours)}</strong></span><input type="range" min="0" max="10" step="0.1" value={queryHours} onChange={event=>setQueryHours(Number(event.target.value))}/></label>
      </div>
      <footer className="jml4-footer"><span>TOY DATA / ORIGINAL JAV'S LAB EXAMPLE</span><span>ONLY THE GOLD DOTS TRAIN THE MODEL</span></footer>
    </section>
  );
}
