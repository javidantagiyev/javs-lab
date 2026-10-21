"use client";

import { useMemo, useState } from "react";
import {
  DEGREES, TRAIN_SIZES, bestByValidation, makeDataset, predict,
  rmse, trainCandidates, underlying, type Evaluation,
} from "./generalization-core";
import "./generalization-lab.css";

const PLOT_W = 480;
const PLOT_H = 224;
const toX = (x: number) => 34 + (x / 10) * 428;
const toY = (y: number) => 203 - (y / 100) * 179;
const pretty = (n: number | null) => n === null || !Number.isFinite(n) ? "—" : n.toFixed(2);

function PlotCurve({ fn, kind }: { fn: (x: number) => number; kind: "fitted" | "truth" }) {
  const line = Array.from({ length: 161 }, (_, i) => {
    const x = (i / 160) * 10;
    const y = fn(x);
    return `${i ? "L" : "M"}${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`;
  }).join(" ");
  return <path d={line} className={`jml6-curve jml6-curve-${kind}`} />;
}

export default function GeneralizationLab() {
  const [size, setSize] = useState<number>(12);
  const [noise, setNoise] = useState<number>(7);
  const [seed, setSeed] = useState(27);
  const [showTruth, setShowTruth] = useState(false);
  const [models, setModels] = useState<Evaluation[] | null>(null);
  const [degree, setDegree] = useState<number>(3);
  const [finalized, setFinalized] = useState(false);
  const [error, setError] = useState("");
  const data = useMemo(() => makeDataset(size, noise, seed), [size, noise, seed]);
  const chosen = models?.find(candidate => candidate.degree === degree) ?? null;
  const best = models ? bestByValidation(models) : null;
  const finalError = finalized && chosen ? rmse(chosen.model, data.test) : null;

  function invalidate() {
    setModels(null);
    setFinalized(false);
    setError("");
  }
  function train() {
    try {
      const result = trainCandidates(data);
      setModels(result);
      setDegree(3);
      setFinalized(false);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not fit the candidates.");
    }
  }

  const suggested = !chosen || !best ? "Train the candidates, then compare how well each degree generalizes." :
    chosen.degree === 1 && chosen.validationRmse > best.validationRmse * 1.13 ? "UNDERFITTING RISK: this straight-line model misses the nonlinear trend. Both errors matter." :
    chosen.degree >= 8 && chosen.validationRmse > best.validationRmse * 1.3 && chosen.trainRmse < chosen.validationRmse * .75 ? "OVERFITTING RISK: training error is much lower than validation error. Complexity is fitting the noise." :
    chosen.degree === best.degree ? "LOWEST VALIDATION ERROR: among these six candidates, this degree generalizes best on the validation set." :
    "Compare this model with the lowest-validation-error candidate. A lower training error is not enough.";

  return <section className="jml6-lab" aria-label="Interactive experiment on underfitting and overfitting">
    <header className="jml6-head">
      <div><span className="jml6-index">EXPERIMENT 006 / MODEL COMPLEXITY</span><h3>Fit the pattern. <em>Not the noise.</em></h3></div>
      <span className="jml6-live"><i /> BROWSER-SIDE FITTING</span>
    </header>
    <div className="jml6-toolbar">
      <label>TRAINING EXAMPLES
        <select value={size} onChange={e => { setSize(Number(e.target.value)); invalidate(); }} aria-label="Number of training examples">
          {TRAIN_SIZES.map(n => <option key={n} value={n}>{n} samples</option>)}
        </select>
      </label>
      <label>MEASUREMENT NOISE
        <select value={noise} onChange={e => { setNoise(Number(e.target.value)); invalidate(); }} aria-label="Measurement noise level">
          <option value="2">Low</option><option value="7">Medium</option><option value="13">High</option>
        </select>
      </label>
      <button type="button" className="jml6-outline" onClick={() => { setSeed(s => s + 1); invalidate(); }}>↻ New sample</button>
    </div>
    <div className="jml6-main">
      <div className="jml6-visual">
        <div className="jml6-section-title"><span>01 / DATA &amp; FIT</span><span>{size} TRAIN · 64 VALIDATION</span></div>
        <svg className="jml6-chart" viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} role="img" aria-label="Gold training samples, teal validation samples, a fitted curve when trained, and an optional dashed true function">
          <defs><clipPath id="jml6-clip"><rect x="34" y="24" width="428" height="179" /></clipPath></defs>
          {[0,25,50,75,100].map(y => <g key={`y${y}`}><line className="jml6-grid" x1="34" x2="462" y1={toY(y)} y2={toY(y)} /><text className="jml6-ticks" textAnchor="end" x="27" y={toY(y)+3}>{y}</text></g>)}
          {[0,2,4,6,8,10].map(x => <g key={`x${x}`}><line className="jml6-grid" y1="24" y2="203" x1={toX(x)} x2={toX(x)} /><text className="jml6-ticks" textAnchor="middle" x={toX(x)} y="219">{x}</text></g>)}
          <g clipPath="url(#jml6-clip)">
            {showTruth && <PlotCurve fn={underlying} kind="truth" />}
            {chosen && <PlotCurve fn={x => predict(chosen.model, x)} kind="fitted" />}
            {data.validation.map(p => <circle className="jml6-dot-val" key={p.id} cx={toX(p.x)} cy={toY(p.y)} r="2.6"><title>{`Validation: x=${p.x.toFixed(2)}, y=${p.y.toFixed(2)}`}</title></circle>)}
            {data.train.map(p => <circle className="jml6-dot-train" key={p.id} cx={toX(p.x)} cy={toY(p.y)} r="3.1"><title>{`Training: x=${p.x.toFixed(2)}, y=${p.y.toFixed(2)}`}</title></circle>)}
          </g>
        </svg>
        <div className="jml6-legend"><span><i className="jml6-swatch jml6-gold" /> TRAIN</span><span><i className="jml6-swatch jml6-teal" /> VALIDATION</span><span><i className="jml6-line jml6-line-fit" /> FITTED MODEL</span><span><i className="jml6-line jml6-line-true" /> TRUE PATTERN</span></div>
        <label className="jml6-truth"><input type="checkbox" checked={showTruth} onChange={e => setShowTruth(e.target.checked)} /> Reveal underlying signal <small>(available only because this dataset is synthetic)</small></label>
        <div className="jml6-error-grid"><div><span>TRAINING RMSE</span><strong>{pretty(chosen?.trainRmse ?? null)}</strong></div><div><span>VALIDATION RMSE</span><strong>{pretty(chosen?.validationRmse ?? null)}</strong></div><div><span>GENERALIZATION GAP</span><strong>{pretty(chosen ? chosen.validationRmse - chosen.trainRmse : null)}</strong></div></div>
      </div>
      <div className="jml6-controls">
        <div className="jml6-section-title"><span>02 / COMPLEXITY</span><span>DEGREE ↑</span></div>
        <button className="jml6-train" type="button" onClick={train} disabled={finalized}>{models ? "↻ Refit six models" : "Train six models →"}</button>
        <div className="jml6-table" role="group" aria-label="Choose polynomial degree and compare errors">
          <div className="jml6-table-head"><span>DEGREE</span><span>TRAIN</span><span>VALID</span></div>
          {DEGREES.map(d => {
            const m = models?.find(candidate => candidate.degree === d);
            return <button className={`jml6-option ${models && degree === d ? "selected" : ""}`} key={d} type="button" disabled={!models || finalized} onClick={() => setDegree(d)} aria-pressed={Boolean(models && degree === d)}>
              <span><i className="jml6-radio" /> {d} {m && d === best?.degree ? "★" : ""}</span><span>{pretty(m?.trainRmse ?? null)}</span><span>{pretty(m?.validationRmse ?? null)}</span>
            </button>;
          })}
        </div>
        <button type="button" className="jml6-pick" disabled={!models || finalized} onClick={() => best && setDegree(best.degree)}>★ Select lowest validation error</button>
        <p className="jml6-insight" role="status">{suggested}</p>
      </div>
    </div>
    {error && <p className="jml6-error" role="alert">{error}</p>}
    <div className="jml6-final">
      <div><span>FINAL HOLDOUT / 64 NEVER-TRAINED EXAMPLES</span><strong>{finalized ? `Test RMSE ${pretty(finalError)}` : "Test score sealed"}</strong><small>{finalized ? "Selection locked. Change data settings to start another run." : "Choose using validation. Reveal test performance once."}</small></div>
      <button type="button" disabled={!models || finalized} onClick={() => setFinalized(true)}>{finalized ? "Test opened ✓" : "Unlock final test →"}</button>
    </div>
    <footer className="jml6-foot"><span>LOW TRAINING ERROR ≠ GOOD GENERALIZATION</span><span>NOISY SYNTHETIC DATA · CHEBYSHEV REGRESSION</span></footer>
  </section>;
}
