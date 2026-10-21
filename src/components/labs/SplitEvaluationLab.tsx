"use client";

import { useMemo, useState } from "react";
import {
  DEGREES, PRESETS, bestValidationCandidate, evaluateCandidates,
  generateSamples, predict, rmse, splitSamples,
  type Candidate, type SplitPreset,
} from "./split-evaluation-core";
import "./split-evaluation-lab.css";

const CHART_W = 460;
const CHART_H = 204;
const px = (x: number) => 31 + (x / 10) * 410;
const py = (y: number) => 185 - (y / 100) * 169;
const pretty = (value: number) => Number.isFinite(value) ? value.toFixed(2) : "—";

function ModelCurve({ model }: { model: Candidate["model"] }) {
  const path = Array.from({ length: 111 }, (_, i) => {
    const x = (i / 110) * 10;
    const y = predict(model, x);
    return `${i === 0 ? "M" : "L"}${px(x).toFixed(2)} ${py(y).toFixed(2)}`;
  }).join(" ");
  return <path d={path} className="jml5-model-curve" fill="none" />;
}

export default function SplitEvaluationLab() {
  const [preset, setPreset] = useState<SplitPreset>("60/20/20");
  const [seed, setSeed] = useState(13);
  const [noise, setNoise] = useState(6);
  const [leak, setLeak] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [chosen, setChosen] = useState<number>(3);
  const [revealed, setRevealed] = useState(false);

  const samples = useMemo(() => generateSamples(noise), [noise]);
  const split = useMemo(() => splitSamples(samples, preset, seed), [samples, preset, seed]);
  const trained = candidates !== null;
  const best = candidates ? bestValidationCandidate(candidates) : null;
  const selected = candidates?.find(row => row.degree === chosen) ?? null;
  const testError = revealed && selected ? rmse(selected.model, split.test) : null;
  const closeToBest = chosen === best?.degree;

  function invalidate() {
    setCandidates(null);
    setRevealed(false);
  }
  function updatePreset(next: SplitPreset) { setPreset(next); invalidate(); }
  function updateNoise(next: number) { setNoise(next); invalidate(); }
  function updateLeak(next: boolean) { setLeak(next); invalidate(); }
  function reshuffle() { setSeed(old => old + 1); invalidate(); }
  function chooseDegree(degree: number) { if (!revealed) setChosen(degree); }

  return <section className="jml5-lab" aria-label="Training, validation and testing interactive experiment">
    <header className="jml5-header">
      <div><div className="jml5-eyebrow">EXPERIMENT 005 / MODEL EVALUATION</div><h3>Split. Select. <em>Test.</em></h3></div>
      <span className="jml5-live"><i /> 60 SYNTHETIC EXAMPLES</span>
    </header>

    <div className="jml5-options">
      <label>DATA SPLIT <select aria-label="Training, validation, and test percentages" value={preset} onChange={e => updatePreset(e.target.value as SplitPreset)}>
        {PRESETS.map(p => <option key={p} value={p}>{p.replaceAll("/", " / ")}</option>)}
      </select></label>
      <label>NOISE LEVEL <select aria-label="Dataset noise level" value={noise} onChange={e => updateNoise(Number(e.target.value))}>
        <option value={2}>Low</option><option value={6}>Medium</option><option value={11}>High</option>
      </select></label>
      <button className="jml5-secondary" type="button" onClick={reshuffle}>↻ Reshuffle split</button>
    </div>

    <div className="jml5-split">
      <div><span className="jml5-key jml5-train" /> <strong>{split.train.length}</strong> TRAIN <small>Fit parameters</small></div>
      <div><span className="jml5-key jml5-validation" /> <strong>{split.validation.length}</strong> VALIDATION <small>Choose complexity</small></div>
      <div><span className="jml5-key jml5-test" /> <strong>{split.test.length}</strong> TEST <small>{revealed ? "Opened once" : "Sealed holdout"}</small></div>
    </div>

    <div className="jml5-main">
      <div className="jml5-plot-wrap">
        <div className="jml5-panel-heading"><span>01 / DATA &amp; FIT</span><small>Gold: train · Teal: validation</small></div>
        <svg className="jml5-plot" viewBox={`0 0 ${CHART_W} ${CHART_H}`} role="img" aria-label="Training and validation samples, fitted regression curve, with test examples concealed until final evaluation">
          <defs><clipPath id="jml5-clip"><rect x="31" y="16" width="410" height="169" /></clipPath></defs>
          {[0,20,40,60,80,100].map(y => <g key={`y${y}`}><line className="jml5-gridline" x1="31" x2="441" y1={py(y)} y2={py(y)} /><text className="jml5-axis" x="25" y={py(y)+3} textAnchor="end">{y}</text></g>)}
          {[0,2,4,6,8,10].map(x => <g key={`x${x}`}><line className="jml5-gridline" x1={px(x)} x2={px(x)} y1="16" y2="185" /><text className="jml5-axis" x={px(x)} y="200" textAnchor="middle">{x}</text></g>)}
          <g clipPath="url(#jml5-clip)">
            {selected && <ModelCurve model={selected.model} />}
            {split.train.map(point => <circle key={`tr${point.id}`} cx={px(point.x)} cy={py(point.y)} r="3.4" className="jml5-point-train"><title>{`Train #${point.id}: x=${point.x.toFixed(1)}, y=${point.y.toFixed(1)}`}</title></circle>)}
            {split.validation.map(point => <circle key={`va${point.id}`} cx={px(point.x)} cy={py(point.y)} r="3.7" className="jml5-point-validation"><title>{`Validation #${point.id}: x=${point.x.toFixed(1)}, y=${point.y.toFixed(1)}`}</title></circle>)}
            {revealed && split.test.map(point => <circle key={`te${point.id}`} cx={px(point.x)} cy={py(point.y)} r="4" className="jml5-point-test"><title>{`Test #${point.id}: x=${point.x.toFixed(1)}, y=${point.y.toFixed(1)}`}</title></circle>)}
          </g>
        </svg>
        <div className="jml5-legend"><span><i className="jml5-key jml5-train" /> TRAINING</span><span><i className="jml5-key jml5-validation" /> VALIDATION</span><span><i className="jml5-key jml5-test" /> TEST {revealed ? "VISIBLE" : "LOCKED"}</span><span><i className="jml5-key jml5-model" /> MODEL</span></div>
        <p className="jml5-plot-note">Test data stays hidden until you finalize a model. Synthetic inputs range from 0 to 10.</p>
      </div>
      <div className="jml5-workflow">
        <div className="jml5-panel-heading"><span>02 / SELECT MODEL</span><small>{trained ? "Measured RMSE ↓" : "Ready to train"}</small></div>
        <button className="jml5-train-btn" type="button" onClick={() => { setCandidates(evaluateCandidates(split, leak)); setRevealed(false); setChosen(3); }} disabled={revealed}>{trained ? "↻ Refit all candidates" : "Train 5 candidates →"}</button>
        <div className="jml5-table" role="group" aria-label="Candidate model training and validation errors">
          <div className="jml5-table-head"><span>DEGREE</span><span>TRAIN</span><span>VALID</span></div>
          {DEGREES.map(degree => {
            const row = candidates?.find(r => r.degree === degree);
            return <button type="button" key={degree} className={`jml5-candidate ${chosen === degree && trained ? "is-active" : ""}`} disabled={!trained || revealed} onClick={() => chooseDegree(degree)} aria-pressed={trained && chosen === degree}>
              <span><i className="jml5-radio" /> {degree}{degree === best?.degree && trained && !leak ? " ★" : ""}</span>
              <span>{trained ? pretty(row!.trainRmse) : "—"}</span>
              <span>{trained ? pretty(row!.validationRmse) : "—"}</span>
            </button>;
          })}
        </div>
        <button className="jml5-pick-btn" type="button" disabled={!trained || revealed || leak} onClick={() => { if (best) chooseDegree(best.degree); }}>Choose lowest validation error ↗</button>
        <label className="jml5-leak"><input type="checkbox" checked={leak} disabled={revealed} onChange={e => updateLeak(e.target.checked)} /><span><strong>Demonstrate data leakage</strong><small>Include validation data in training (wrong!)</small></span></label>
      </div>
    </div>

    {leak ? <p className="jml5-alert" role="status"><strong>Validation is contaminated.</strong> The models have seen the validation labels during fitting. Those errors are no longer independent estimates; turn this off and retrain before using the test set.</p> : trained ? <p className="jml5-guidance" role="status">{closeToBest ? `Degree ${chosen} has the lowest validation RMSE in this run. ` : `Degree ${chosen} was selected; degree ${best?.degree} has the lowest validation RMSE. `}The training error helps describe fit, but the validation error guides selection.</p> : <p className="jml5-guidance" role="status">Train the candidates, compare their <strong>validation errors</strong>, and choose one before the sealed test set is revealed.</p>}

    <div className="jml5-final">
      <div className="jml5-final-info"><span className="jml5-eyebrow">03 / FINAL HOLDOUT</span><strong>{revealed ? `Test RMSE: ${pretty(testError ?? NaN)}` : "Test RMSE: ••••"}</strong><small>{revealed ? `Model degree ${chosen} · ${split.test.length} unseen test examples` : "Choose a model using validation, then test it once."}</small></div>
      <button className="jml5-test-btn" type="button" disabled={!trained || leak || revealed} onClick={() => setRevealed(true)}>{revealed ? "✓ Test completed" : "Unlock final test →"}</button>
    </div>
    {revealed && <p className="jml5-complete" role="status">Evaluation complete. The test set was excluded from fitting and selection. Your model choice is locked for this run. If you inspect test results repeatedly across new runs and use them to make decisions, you risk overfitting your evaluation process.</p>}
    <footer className="jml5-footer"><span>FICTIONAL DATA · IN-BROWSER LEAST SQUARES</span><span>NO NETWORK REQUESTS</span></footer>
  </section>;
}
