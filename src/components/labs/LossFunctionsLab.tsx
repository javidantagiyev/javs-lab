"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent, KeyboardEvent } from "react";
import {
  PRESETS, samplesFor, clamp, round, evaluate, constantSummary, constantErrors,
} from "./loss-functions-core";
import type { Scenario, Objective } from "./loss-functions-core";
import "./loss-functions-lab.css";

const VIEW={width:376,height:210,left:35,right:9,top:10,bottom:29};
const W=VIEW.width-VIEW.left-VIEW.right;
const H=VIEW.height-VIEW.top-VIEW.bottom;
const y=(v:number)=>VIEW.top+(100-v)/100*H;
const x=(index:number,count:number)=>VIEW.left+W*(index+.5)/count;
const fmt=(v:number,n=2)=>Number.isFinite(v)?v.toFixed(n):"—";

type Drag={id:number;pointerId:number};

export default function LossFunctionsLab(){
  const [preset,setPreset]=useState<Scenario>("baseline");
  const [samples,setSamples]=useState(()=>samplesFor("baseline"));
  const [selected,setSelected]=useState(1);
  const [objective,setObjective]=useState<Objective>("mse");
  const [showBreakdown,setShowBreakdown]=useState(false);
  const [constantValue,setConstantValue]=useState(50);
  const [status,setStatus]=useState("Drag a teal prediction point or use the slider to change one error.");
  const drag=useRef<Drag|null>(null);
  const metrics=useMemo(()=>evaluate(samples),[samples]);
  const current=samples.find(s=>s.id===selected)??samples[0];
  const optimum=useMemo(()=>constantSummary(samples.map(s=>s.truth)),[samples]);
  const constant=useMemo(()=>constantErrors(samples.map(s=>s.truth),constantValue),[samples,constantValue]);
  const objectiveValue=metrics[objective];
  const metricContribution=(item:{absolute:number;squared:number})=>objective==="mae"?item.absolute:objective==="mse"?item.squared:item.squared;
  const biggestContribution=Math.max(1,...metrics.items.map(metricContribution));

  function changeScenario(next:Scenario){
    setPreset(next);setSamples(samplesFor(next));setSelected(1);setConstantValue(50);
    setStatus(PRESETS[next].description);
  }
  function changePrediction(id:number,value:number){
    const next=clamp(Math.round(value),0,100);
    setSamples(rows=>rows.map(s=>s.id===id?{...s,prediction:next}:s));
  }
  function toPrediction(event:PointerEvent<SVGSVGElement>){
    const rect=event.currentTarget.getBoundingClientRect();
    if(!rect.height)return null;
    // SVG viewBox uses the fixed aspect ratio in CSS; account for possible letterboxing.
    const scale=Math.min(rect.width/VIEW.width,rect.height/VIEW.height);
    const offsetY=(rect.height-VIEW.height*scale)/2;
    const py=(event.clientY-rect.top-offsetY)/scale;
    return clamp(100-(py-VIEW.top)/H*100,0,100);
  }
  function onDown(event:PointerEvent<SVGCircleElement>,id:number){
    event.preventDefault();event.stopPropagation();
    setSelected(id);drag.current={id,pointerId:event.pointerId};
    event.currentTarget.setPointerCapture(event.pointerId);
    setStatus("You changed a prediction, not its actual target value.");
  }
  function onMove(event:PointerEvent<SVGSVGElement>){
    if(!drag.current||drag.current.pointerId!==event.pointerId)return;
    const next=toPrediction(event);if(next!==null)changePrediction(drag.current.id,next);
  }
  function onStop(){drag.current=null;}
  function onKey(event:KeyboardEvent<SVGCircleElement>,id:number){
    const step=event.shiftKey?5:1;
    if(event.key==="ArrowUp"||event.key==="ArrowDown"){
      event.preventDefault();setSelected(id);
      const current=samples.find(s=>s.id===id);
      if(current)changePrediction(id,current.prediction+(event.key==="ArrowUp"?step:-step));
    }
  }
  return <section className="jml9-lab" aria-label="Lesson nine loss functions experiment">
    <header className="jml9-head"><div><span className="jml9-eyebrow">EXPERIMENT 009 / REGRESSION</span><h3>Measure the <em>mistake.</em></h3></div><span className="jml9-live"><i/> LIVE ERROR METRICS</span></header>
    <div className="jml9-intro"><span>{PRESETS[preset].description}</span><strong>{samples.length} predictions</strong></div>
    <div className="jml9-metrics" aria-live="polite">
      {(["mae","mse","rmse"] as const).map(key=><button key={key} type="button" aria-pressed={objective===key} onClick={()=>setObjective(key)} className={objective===key?"active":""}><span>{key.toUpperCase()}</span><strong>{fmt(metrics[key])}</strong><small>{key==="mse"?"points²":"points"}</small></button>)}
    </div>
    <div className="jml9-main">
      <div className="jml9-graph-pane">
        <div className="jml9-panel-title"><span>01 / PREDICTIONS VS TARGETS</span><span>DRAG TEAL POINTS ↕</span></div>
        <svg className="jml9-chart" viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} onPointerMove={onMove} onPointerUp={onStop} onPointerCancel={onStop} role="group" aria-label="Graph of six ground-truth targets in gold and predictions in teal. Vertical segments show the errors.">
          <rect width={VIEW.width} height={VIEW.height} fill="#131712" rx="6" />
          {[0,20,40,60,80,100].map(v=><g key={v}><line x1={VIEW.left} x2={VIEW.width-VIEW.right} y1={y(v)} y2={y(v)} stroke="#363c34" strokeWidth=".65"/><text className="jml9-axis" x={VIEW.left-9} y={y(v)+3} textAnchor="end">{v}</text></g>)}
          {samples.map((s,i)=><g key={s.id}>
            <rect x={x(i,samples.length)-W/samples.length*.42} y={VIEW.top} width={W/samples.length*.84} height={H} fill={selected===s.id?"#29291d":"transparent"} opacity={selected===s.id?".6":1} rx="4" pointerEvents="none" />
            <line x1={x(i,samples.length)} x2={x(i,samples.length)} y1={y(s.truth)} y2={y(s.prediction)} stroke={selected===s.id?"#edbf82":"#9b8466"} strokeWidth="2" strokeDasharray="4 3" opacity=".9" pointerEvents="none" />
            <circle cx={x(i,samples.length)} cy={y(s.truth)} r="4.7" fill="#e4bc83" stroke="#171912" strokeWidth="1.4" pointerEvents="none" />
            <circle cx={x(i,samples.length)} cy={y(s.prediction)} r={selected===s.id?"7":"6"} fill="#9fc6b4" stroke={selected===s.id?"#f6ecd6":"#163429"} strokeWidth="2" role="button" tabIndex={0} aria-label={`Sample ${i+1}, prediction ${s.prediction}; arrow keys adjust prediction`} onPointerDown={(event:PointerEvent<SVGCircleElement>)=>onDown(event,s.id)} onKeyDown={(event:KeyboardEvent<SVGCircleElement>)=>onKey(event,s.id)} style={{cursor:"ns-resize",touchAction:"none"}} />
            <text className="jml9-axis" textAnchor="middle" x={x(i,samples.length)} y={VIEW.height-10}>{i+1}</text>
          </g>)}
        </svg>
        <div className="jml9-legend"><span><i className="jml9-target"/> Actual targets</span><span><i className="jml9-pred"/> Predictions</span><span><i className="jml9-residual"/> Error</span></div>
        <div className="jml9-contribhead"><span>02 / PER-SAMPLE {objective==="mae"?"ABSOLUTE ERROR":"SQUARED ERROR"}</span><small>{objective==="rmse"?"RMSE uses the mean squared errors, then takes a square root":"Click a bar to edit that sample"}</small></div>
        <div className="jml9-bars" aria-label="Error contribution by observation">
          {metrics.items.map((item,i)=><button key={item.id} type="button" aria-label={`Select sample ${i+1}`} title={`Sample ${i+1}: ${fmt(metricContribution(item))}`} onClick={()=>setSelected(item.id)} className={item.id===selected?"selected":""}><div><span style={{height:`${metricContribution(item)===0?0:Math.max(3,metricContribution(item)/biggestContribution*100)}%`}}/></div><small>{i+1}</small></button>)}
        </div>
      </div>
      <div className="jml9-controls">
        <div className="jml9-panel-title"><span>03 / CHANGE THE ERRORS</span></div>
        <label className="jml9-select">DATASET
          <select value={preset} onChange={(e:ChangeEvent<HTMLSelectElement>)=>changeScenario(e.target.value as Scenario)}>
            {(Object.keys(PRESETS) as Scenario[]).map(key=><option key={key} value={key}>{PRESETS[key].label}</option>)}
          </select>
        </label>
        <div className="jml9-sample"><span>SELECTED SAMPLE <strong>#{samples.findIndex(s=>s.id===selected)+1}</strong></span><small>Actual target <strong>{current.truth}</strong></small></div>
        <label className="jml9-range"><span>PREDICTION <strong>{current.prediction}</strong></span><input type="range" min="0" max="100" step="1" value={current.prediction} onChange={(e:ChangeEvent<HTMLInputElement>)=>changePrediction(current.id,Number(e.target.value))}/></label>
        <div className="jml9-sample-numbers"><div><span>RESIDUAL</span><strong>{fmt(current.truth-current.prediction,0)}</strong></div><div><span>ABSOLUTE</span><strong>{fmt(Math.abs(current.truth-current.prediction),0)}</strong></div><div><span>SQUARED</span><strong>{fmt((current.truth-current.prediction)**2,0)}</strong></div></div>
        <div className="jml9-actions"><button type="button" onClick={()=>{changePrediction(current.id,current.truth);setStatus("This prediction now matches its target; the selected residual is zero.");}}>Make exact</button><button type="button" onClick={()=>changeScenario("baseline")}>↺ Reset</button></div>
        <div className="jml9-tip">Try “One huge mistake,” then fix sample #6. Compare how MAE and MSE respond.</div>
      </div>
    </div>
    <div className="jml9-summary"><strong>{objective.toUpperCase()} = {fmt(objectiveValue)}</strong><span>{objective==="mae"?"Average size of absolute errors":objective==="mse"?"Average squared error":"Square root of the average squared error"}</span><button type="button" onClick={()=>setShowBreakdown(v=>!v)} aria-expanded={showBreakdown}>{showBreakdown?"Hide table ↑":"Show calculations ↓"}</button></div>
    {showBreakdown&&<div className="jml9-breakdown"><table><thead><tr><th>Sample</th><th>Actual</th><th>Pred.</th><th>Residual</th><th>|Error|</th><th>Error²</th></tr></thead><tbody>{metrics.items.map((item,i)=><tr key={item.id}><td>{i+1}</td><td>{item.truth}</td><td>{item.prediction}</td><td>{fmt(item.residual,0)}</td><td>{fmt(item.absolute,0)}</td><td>{fmt(item.squared,0)}</td></tr>)}</tbody></table></div>}
    <div className="jml9-constant">
      <div className="jml9-constant-head"><div><span className="jml9-eyebrow">EXPERIMENT B / ONE CONSTANT FOR EVERYONE</span><h4>Mean or <em>median?</em></h4></div><span>NO INPUT FEATURES</span></div>
      <p>Predict exactly the same number for every target. Move the guess and compare its errors. For this dataset, the <strong>mean minimizes MSE and RMSE</strong>; a <strong>median minimizes MAE</strong>.</p>
      <label className="jml9-range"><span>CONSTANT GUESS <strong>{fmt(constantValue,0)}</strong></span><input type="range" min="0" max="100" step="1" value={constantValue} onChange={(e:ChangeEvent<HTMLInputElement>)=>setConstantValue(Number(e.target.value))}/></label>
      <div className="jml9-constantbuttons"><button type="button" onClick={()=>setConstantValue(round(optimum.mean,0))}>Use mean: {fmt(optimum.mean,1)}</button><button type="button" onClick={()=>setConstantValue(round(optimum.median,0))}>Use median: {fmt(optimum.median,1)}</button></div>
      <div className="jml9-constantmetrics"><span>MAE <strong>{fmt(constant.mae,2)}</strong></span><span>MSE <strong>{fmt(constant.mse,2)}</strong></span><span>RMSE <strong>{fmt(constant.rmse,2)}</strong></span></div>
      <small>Try a dataset with a very uneven target distribution to see a bigger difference. The buttons round to whole-number slider steps, so the displayed optimum is approximate when the exact mean or median is fractional.</small>
    </div>
    <p role="status" className="jml9-status">{status}</p>
    <footer className="jml9-footer"><span>SYNTHETIC DATA · SIX OBSERVATIONS</span><span>ALL METRICS CALCULATED LOCALLY</span></footer>
  </section>;
}
