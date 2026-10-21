"use client";

import { useState } from "react";
import {
  DEFAULT_CONFIG, ORIGINAL_ROWS, runPipeline,
  type Configuration, type Example, type PipelineResult, type Zone,
} from "./preprocessing-core";
import "./preprocessing-lab.css";

const ZONES: Zone[] = ["Center", "Suburb", "Coast", "Hills"];
const fmt = (value: number | null, digits = 2) => value === null || !Number.isFinite(value) ? "—" : Number(value.toFixed(digits)).toString();

type Display = "raw" | "prepared";
export default function PreprocessingLab() {
  const [rows, setRows] = useState<Example[]>(() => ORIGINAL_ROWS.map(r=>({...r})));
  const [config, setConfig] = useState<Configuration>({...DEFAULT_CONFIG});
  const [model, setModel] = useState<PipelineResult | null>(null);
  const [display, setDisplay] = useState<Display>("raw");
  const [selectedId, setSelectedId] = useState("T03");
  const [editOpen, setEditOpen] = useState(false);
  const [areaInput, setAreaInput] = useState("78");
  const [ageInput, setAgeInput] = useState("");
  const [zoneInput, setZoneInput] = useState<Zone>("Center");
  const [message, setMessage] = useState("");
  const selected = rows.find(r=>r.id===selectedId) ?? rows[0];
  const trainingCount = rows.filter(r=>r.split==="train").length;
  const validationCount = rows.length-trainingCount;

  function changeSetting<K extends keyof Configuration>(key:K,value:Configuration[K]) {
    setConfig(prev=>({...prev,[key]:value}));
    setModel(null);
    setDisplay("raw");
    setMessage("Settings changed. Run pipeline to update the transformed data.");
  }
  function selectRow(row:Example) {
    if(row.split!=="train") return;
    setSelectedId(row.id);
    setAreaInput(String(row.area));
    setAgeInput(row.age===null ? "" : String(row.age));
    setZoneInput(row.zone);
    setEditOpen(true);
    setMessage("");
  }
  function saveRow() {
    const area=Number(areaInput);
    const age=ageInput.trim()==="" ? null : Number(ageInput);
    if(!areaInput.trim() || !Number.isFinite(area) || area<20 || area>300 ||
       (age!==null && (!Number.isFinite(age)||age<0||age>120))) {
      setMessage("Enter an area from 20–300 and an age from 0–120 (or blank for missing).");
      return;
    }
    setRows(prev=>prev.map(row=>row.id===selected.id ? {...row,area,age,zone:zoneInput}:row));
    setModel(null);
    setDisplay("raw");
    setMessage(`${selected.id} updated. Its target price remains unchanged. Run pipeline again.`);
  }
  function train() {
    try {
      setModel(runPipeline(rows,config));
      setDisplay("prepared");
      setMessage(config.leak ? "Leakage demonstration active: preprocessing statistics used validation FEATURES. Do not use this workflow in a real project." :
        "Pipeline fitted on training data only. Validation labels were used solely for evaluation.");
    } catch(error) {
      setModel(null);
      setMessage(error instanceof Error ? error.message : "Could not fit preprocessing pipeline.");
    }
  }
  function reset() {
    setRows(ORIGINAL_ROWS.map(r=>({...r})));
    setConfig({...DEFAULT_CONFIG});
    setModel(null);
    setDisplay("raw");
    setSelectedId("T03");
    setAreaInput("78");
    setAgeInput("");
    setZoneInput("Center");
    setEditOpen(false);
    setMessage("Demo restored to its initial dataset and safe preprocessing settings.");
  }
  return <section className="jml7-lab" aria-label="Data preprocessing interactive experiment">
    <header className="jml7-header">
      <div><span className="jml7-eyebrow">EXPERIMENT 007 / DATA PREPARATION</span><h3>From raw data <em>to model-ready.</em></h3></div>
      <span className="jml7-status"><i/> BROWSER-SIDE PIPELINE</span>
    </header>
    <div className="jml7-banner"><span>DATASET</span><strong>Fictional Baku-area homes</strong><small>{trainingCount} TRAIN / {validationCount} VALIDATION</small></div>
    <div className="jml7-layout">
      <div className="jml7-pane">
        <div className="jml7-pane-head"><span>01 / INSPECT DATA</span><div className="jml7-tabs"><button type="button" className={display==="raw"?"active":""} onClick={()=>setDisplay("raw")}>Raw</button><button type="button" className={display==="prepared"?"active":""} disabled={!model} onClick={()=>setDisplay("prepared")}>Prepared</button></div></div>
        <div className="jml7-table-scroll" role="region" aria-label={display==="raw"?"Unprocessed training and validation dataset":"Transformed data preview"} tabIndex={0}>
          {display==="raw" || !model ? <table className="jml7-table"><thead><tr><th>ID</th><th>Area</th><th>Age</th><th>Zone</th><th>Price*</th></tr></thead><tbody>
            {rows.map(row=><tr key={row.id} className={`${row.split==="validation" ? "validation":""} ${selectedId===row.id&&editOpen?"picked":""}`} onClick={()=>selectRow(row)} title={row.split==="train"?"Click to edit training row":"Validation rows are held out; not editable"}>
              <td><span className="jml7-row-dot"/>{row.id}</td><td>{row.area}</td><td className={row.age===null?"missing":""}>{row.age??"MISSING"}</td><td>{row.zone}</td><td>{row.price}</td></tr>)}
          </tbody></table> : <table className="jml7-table jml7-prepared"><thead><tr><th>ID</th>{model.columns.map(col=><th key={col}>{col.replace("zone_", "")}</th>)}</tr></thead><tbody>
            {[...model.train,...model.validation].map(row=><tr key={row.id} className={row.split==="validation"?"validation":""}><td><span className="jml7-row-dot"/>{row.id}</td>{row.vector.map((value,index)=><td key={index}>{fmt(value,2)}</td>)}</tr>)}
          </tbody></table>}
        </div>
        <div className="jml7-legend"><span><i className="jml7-gold"/> Training</span><span><i className="jml7-teal"/> Validation</span><span>* target (not an input)</span></div>
        {!editOpen ? <button className="jml7-edit-toggle" type="button" onClick={()=>selectRow(selected)}>✎ Edit training example</button> :
          <div className="jml7-editor"><div className="jml7-editor-head"><span>EDIT {selected.id} / TRAIN ONLY</span><button type="button" onClick={()=>setEditOpen(false)}>×</button></div>
            <div className="jml7-editor-fields"><label>Area (m²)<input value={areaInput} onChange={e=>setAreaInput(e.target.value)} inputMode="decimal" aria-label="Edit training area"/></label>
            <label>Age (blank = missing)<input value={ageInput} onChange={e=>setAgeInput(e.target.value)} inputMode="decimal" aria-label="Edit training age" placeholder="Missing"/></label>
            <label>Zone<select value={zoneInput} onChange={e=>setZoneInput(e.target.value as Zone)}>{ZONES.map(z=><option key={z}>{z}</option>)}</select></label></div>
            <button type="button" className="jml7-save" onClick={saveRow}>Save training row ↗</button>
          </div>}
      </div>
      <div className="jml7-pane jml7-controls">
        <div className="jml7-pane-head"><span>02 / CONFIGURE PIPELINE</span></div>
        <label className="jml7-setting">MISSING AGE
          <select value={config.missing} onChange={e=>changeSetting("missing",e.target.value as Configuration["missing"])}>
            <option value="median">Impute median</option><option value="mean">Impute mean</option><option value="drop">Drop missing rows</option>
          </select>
        </label>
        <label className="jml7-setting">FEATURE SCALING
          <select value={config.scaling} onChange={e=>changeSetting("scaling",e.target.value as Configuration["scaling"])}>
            <option value="standard">Standardize (z-score)</option><option value="minmax">Min–max (0–1 on train)</option><option value="none">No scaling</option>
          </select>
        </label>
        <label className="jml7-check"><input type="checkbox" checked={config.encode} onChange={e=>changeSetting("encode",e.target.checked)}/> One-hot encode neighborhood</label>
        <label className="jml7-check jml7-leak"><input type="checkbox" checked={config.leak} onChange={e=>changeSetting("leak",e.target.checked)}/> <span>Leakage demo <small>Fit transformer on train + validation</small></span></label>
        <div className="jml7-flow" aria-label="Transformation pipeline steps"><span>RAW</span><b>→</b><span>IMPUTE</span><b>→</b><span>ENCODE + SCALE</span></div>
        <button className="jml7-run" type="button" onClick={train}>↗ Fit pipeline &amp; evaluate</button>
        <button className="jml7-reset" type="button" onClick={reset}>↺ Restore original data</button>
      </div>
    </div>
    <div className="jml7-results" aria-live="polite">
      <div className="jml7-metrics">
        <div><span>AGE FILL VALUE</span><strong>{model ? (model.stats.ageFill===null?"Drop rows":`${fmt(model.stats.ageFill,1)} years`):"—"}</strong></div>
        <div><span>FIT ROWS</span><strong>{model?model.stats.fitRowCount:"—"}</strong></div>
        <div><span>VALIDATION MAE</span><strong>{model?model.mae===null?"No examples":`${fmt(model.mae,1)}k AZN`:"—"}</strong></div>
      </div>
      {model ? <>
        <p className={`jml7-note ${config.leak?"jml7-danger":""}`}><strong>{config.leak?"⚠ LEAKAGE ENABLED":"✓ SAFE TRAIN-ONLY FIT"}</strong> · {model.train.length} train samples and {model.validation.length} validation samples retained. {model.skippedTrain+model.skippedValidation>0?`${model.skippedTrain} train and ${model.skippedValidation} validation rows dropped.`:"No rows dropped."}</p>
        {model.unseenZones.length>0 && <p className="jml7-info">Unknown validation category: <strong>{model.unseenZones.join(", ")}</strong>. One-hot encoding maps it to zeros in all known category columns.</p>}
        <details className="jml7-details"><summary>Inspect fitted statistics &amp; validation predictions <span>⌄</span></summary>
          <div className="jml7-stat-grid"><div><span>Area mean / SD</span><strong>{fmt(model.stats.areaMean,1)} / {fmt(model.stats.areaSD,1)}</strong></div><div><span>Age mean / SD</span><strong>{fmt(model.stats.ageMean,1)} / {fmt(model.stats.ageSD,1)}</strong></div><div><span>Learned zones</span><strong>{model.stats.zones.join(", ")}</strong></div><div><span>Feature columns</span><strong>{model.columns.length}</strong></div></div>
          <div className="jml7-predictions"><div>ID</div><div>ACTUAL</div><div>3-NN PRED</div><div>ABS ERROR</div>{model.predictions.map(p=><div className="jml7-pred-row" key={p.id}><span>{p.id}</span><span>{fmt(p.actual)}k</span><span>{fmt(p.predicted,1)}k</span><span>{fmt(p.error,1)}k</span></div>)}</div>
        </details>
      </> : <p className="jml7-note">Select preprocessing choices, then fit the pipeline. The 3-nearest-neighbors predictor uses transformed training features only.</p>}
      {message && <p className={`jml7-message ${config.leak?"warn":""}`} role="status">{message}</p>}
    </div>
    <footer className="jml7-footer"><span>FIT ON TRAIN → TRANSFORM VALIDATION</span><span>SYNTHETIC DATA · NOT A PRICE FORECAST</span></footer>
  </section>;
}
