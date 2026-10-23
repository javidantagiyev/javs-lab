"use client";

import { useId, useMemo, useRef, useState, type PointerEvent, type MouseEvent, type KeyboardEvent, type ChangeEvent } from "react";
import {
  INITIAL_PARAMETERS, clamp, leastSquares, observationsFor, predict, score,
  type Observation, type Parameters, type PresetKey,
} from "./linear-regression-core";
import "./linear-regression-lab.css";

const VIEW={w:490,h:264,l:41,r:14,t:14,b:33};
const usableW=VIEW.w-VIEW.l-VIEW.r;
const usableH=VIEW.h-VIEW.t-VIEW.b;
const px=(x:number)=>VIEW.l+(x/10)*usableW;
const py=(y:number)=>VIEW.t+((110-y)/110)*usableH;
const fmt=(v:number,d=2)=>Number.isFinite(v)?Number(v.toFixed(d)).toString():"—";
const formatSigned=(v:number)=>`${v>=0?"+":"−"} ${fmt(Math.abs(v),2)}`;

type Pointing = {id:number; pointerId:number; moved:boolean};

export default function LinearRegressionLab(){
  const clipId=useId().replace(/:/g,"");
  const [preset,setPreset]=useState<PresetKey>("clear");
  const [points,setPoints]=useState<Observation[]>(()=>observationsFor("clear"));
  const [manual,setManual]=useState<Parameters>({...INITIAL_PARAMETERS});
  const [fitted,setFitted]=useState(false);
  const [showResiduals,setShowResiduals]=useState(true);
  const [compare,setCompare]=useState(false);
  const [queryX,setQueryX]=useState(5);
  const [status,setStatus]=useState("Move the parameters by hand, then press Fit least squares.");
  const drag=useRef<Pointing|null>(null);
  const nextId=useRef(10);
  const best=useMemo(()=>leastSquares(points),[points]);
  const model=fitted?best.params:manual;
  const errors=useMemo(()=>score(points,model),[points,model]);
  const prediction=predict(model,queryX);

  function changePreset(value:PresetKey){
    setPreset(value);setPoints(observationsFor(value));setManual({...INITIAL_PARAMETERS});setFitted(false);
    setStatus(value==="outlier"?"One observation was moved down. Fit the line and compare it with the clear trend.":"New observations loaded. Adjust the line or fit least squares.");
  }
  function changeParam(field:keyof Parameters,value:number){
    setFitted(false);setManual(old=>({...old,[field]:value}));setStatus("Manual line: changing the slope or intercept changes every prediction.");
  }
  function fit(){setFitted(true);setStatus(best.degenerate?"All x-values are the same, so the slope cannot be estimated uniquely; using the horizontal mean line.":"Least squares calculated the slope and intercept minimizing the training SSE.");}
  function reset(){changePreset("clear");setShowResiduals(true);setCompare(false);setQueryX(5);setStatus("Restored original data and initial line.");}
  function coordinates(event:{clientX:number;clientY:number;currentTarget:SVGSVGElement}){
    const rect=event.currentTarget.getBoundingClientRect();
    if(!rect.width || !rect.height)return null;
    const sx=(event.clientX-rect.left)/rect.width*VIEW.w;
    const sy=(event.clientY-rect.top)/rect.height*VIEW.h;
    return {x:Math.round(clamp((sx-VIEW.l)/usableW*10,0,10)*10)/10,y:Math.round(clamp(110-(sy-VIEW.t)/usableH*110,0,110))};
  }
  function addPoint(event:MouseEvent<SVGRectElement>){
    const owner=event.currentTarget.ownerSVGElement;
    if(!owner)return;
    const c=coordinates({clientX:event.clientX,clientY:event.clientY,currentTarget:owner});
    if(!c)return;
    setPoints(old=>[...old,{...c,id:nextId.current++}]);
    setStatus("An observation was added; the line updates if least squares is active.");
  }
  function movePoint(event:PointerEvent<SVGSVGElement>){
    const active=drag.current;
    if(!active || active.pointerId!==event.pointerId)return;
    const c=coordinates(event);
    if(!c)return;
    drag.current={...active,moved:true};
    setPoints(old=>old.map(p=>p.id===active.id?{...p,...c}:p));
  }
  function stopPoint(){
    if(drag.current?.moved)setStatus("Observation updated. Compare how the least-squares line responds.");
    drag.current=null;
  }
  function startPoint(event:PointerEvent<SVGCircleElement>,id:number){
    event.preventDefault();event.stopPropagation();
    drag.current={id,pointerId:event.pointerId,moved:false};
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function keyboardPoint(event:KeyboardEvent<SVGCircleElement>,id:number){
    const directions:Record<string,[number,number]>={ArrowLeft:[-0.1,0],ArrowRight:[0.1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};
    const delta=directions[event.key];if(!delta)return;
    event.preventDefault();
    setPoints(old=>old.map(p=>p.id===id?{...p,x:Math.round(clamp(p.x+delta[0],0,10)*10)/10,y:clamp(p.y+delta[1],0,110)}:p));
  }
  function removeLast(){if(points.length<=2)return;setPoints(old=>old.slice(0,-1));setStatus("Removed the most recently listed observation.");}
  const yAt=(x:number,params:Parameters)=>py(predict(params,x));
  const eq=`ŷ = ${fmt(model.intercept)} ${formatSigned(model.slope)}x`;
  return <section className="jml8-lab" aria-label="Linear regression interactive least squares experiment">
    <header className="jml8-header"><div><span className="jml8-overline">EXPERIMENT 008 / REGRESSION</span><h3>Find the best-fit <em>line.</em></h3></div><span className="jml8-live"><i/> ACTUAL LEAST SQUARES</span></header>
    <div className="jml8-model"><span>MODEL EQUATION</span><strong>{eq}</strong><small>{fitted?"LEAST-SQUARES FIT":"MANUAL PARAMETERS"}</small></div>
    <div className="jml8-main">
      <div className="jml8-graph-area">
        <div className="jml8-section-title"><span>01 / OBSERVATIONS</span><span>DRAG A POINT · CLICK EMPTY SPACE TO ADD</span></div>
        <svg className="jml8-chart" viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} onPointerMove={movePoint} onPointerUp={stopPoint} onPointerCancel={stopPoint} role="img" aria-label="Scatterplot of synthetic study hours versus practice score with draggable points and a linear prediction model. Arrow keys can move focused points.">
          <defs><clipPath id={clipId}><rect x={VIEW.l} y={VIEW.t} width={usableW} height={usableH}/></clipPath></defs>
          <rect width={VIEW.w} height={VIEW.h} fill="#121510" rx="5"/>
          {[0,2,4,6,8,10].map(x=><g key={`x-${x}`}><line x1={px(x)} x2={px(x)} y1={VIEW.t} y2={VIEW.h-VIEW.b} stroke="#393e35" strokeWidth=".7"/><text x={px(x)} y={VIEW.h-14} textAnchor="middle" className="jml8-axis-text">{x}</text></g>)}
          {[0,20,40,60,80,100].map(y=><g key={`y-${y}`}><line x1={VIEW.l} x2={VIEW.w-VIEW.r} y1={py(y)} y2={py(y)} stroke="#393e35" strokeWidth=".7"/><text x={VIEW.l-8} y={py(y)+3} textAnchor="end" className="jml8-axis-text">{y}</text></g>)}
          <text x={(VIEW.l+VIEW.w-VIEW.r)/2} y={VIEW.h-2} textAnchor="middle" className="jml8-axis-label">STUDY HOURS (x)</text>
          <text x="11" y={VIEW.h/2} textAnchor="middle" className="jml8-axis-label" transform={`rotate(-90 11 ${VIEW.h/2})`}>PRACTICE SCORE (y)</text>
          <rect x={VIEW.l} y={VIEW.t} width={usableW} height={usableH} fill="transparent" onClick={addPoint} style={{cursor:"crosshair"}}/>
          <g clipPath={`url(#${clipId})`} pointerEvents="none">
            {compare&&!fitted&&<line x1={px(0)} x2={px(10)} y1={yAt(0,best.params)} y2={yAt(10,best.params)} stroke="#8ebbb0" strokeDasharray="7 5" strokeWidth="2"/>}
            {showResiduals&&points.map(p=><line key={`err-${p.id}`} x1={px(p.x)} x2={px(p.x)} y1={py(p.y)} y2={yAt(p.x,model)} stroke="#bda07a" strokeWidth="1.5" strokeDasharray="3 3" opacity=".8"/>)}
            <line x1={px(0)} x2={px(10)} y1={yAt(0,model)} y2={yAt(10,model)} stroke="#efc68c" strokeWidth="3"/>
            <circle cx={px(queryX)} cy={yAt(queryX,model)} r="5.5" stroke="#a7d2be" fill="#153027" strokeWidth="2"/>
          </g>
          {points.map((p,index)=><circle key={p.id} cx={px(p.x)} cy={py(p.y)} r="5.5" fill="#dabb88" stroke="#2b2419" strokeWidth="1.5" tabIndex={0} role="button" aria-label={`Observation ${index+1}, x ${fmt(p.x,1)}, y ${fmt(p.y,0)}; use arrow keys to move`} onKeyDown={(e:KeyboardEvent<SVGCircleElement>)=>keyboardPoint(e,p.id)} onPointerDown={(e:PointerEvent<SVGCircleElement>)=>startPoint(e,p.id)} style={{cursor:"grab",touchAction:"none"}}/>)}
        </svg>
        <div className="jml8-legend"><span><i className="dot"/> Observations</span><span><i className="line"/> Prediction line</span><span><i className="teal"/> {compare&&!fitted?"OLS reference":"Test prediction"}</span></div>
        <label className="jml8-check"><input type="checkbox" checked={showResiduals} onChange={(e:ChangeEvent<HTMLInputElement>)=>setShowResiduals(e.target.checked)}/> Show residual distances</label>
        <label className="jml8-check"><input type="checkbox" checked={compare} onChange={(e:ChangeEvent<HTMLInputElement>)=>setCompare(e.target.checked)}/> Show least-squares reference (teal dashed)</label>
      </div>
      <div className="jml8-controls">
        <div className="jml8-section-title"><span>02 / FIT THE MODEL</span></div>
        <label className="jml8-select">DATASET
          <select value={preset} onChange={(e:ChangeEvent<HTMLSelectElement>)=>changePreset(e.target.value as PresetKey)}>
            <option value="clear">Clear upward trend</option><option value="noisy">Noisy trend</option><option value="falling">Negative relationship</option><option value="outlier">Influential outlier</option>
          </select>
        </label>
        <label className="jml8-range"><span>INTERCEPT <strong>{fmt(model.intercept,1)}</strong></span><input type="range" min="-20" max="110" step="1" value={clamp(model.intercept,-20,110)} onChange={(e:ChangeEvent<HTMLInputElement>)=>changeParam("intercept",Number(e.target.value))}/></label>
        <label className="jml8-range"><span>SLOPE <strong>{fmt(model.slope,2)}</strong></span><input type="range" min="-14" max="14" step="0.1" value={clamp(model.slope,-14,14)} onChange={(e:ChangeEvent<HTMLInputElement>)=>changeParam("slope",Number(e.target.value))}/></label>
        <button type="button" className="jml8-primary" onClick={fit}>↗ Fit least squares</button>
        <div className="jml8-secondary-actions"><button type="button" onClick={removeLast} disabled={points.length<=2}>− Remove last point</button><button type="button" onClick={reset}>↺ Reset</button></div>
        <div className="jml8-rule">OLS minimizes the <strong>sum of squared vertical residuals</strong> for this fixed dataset.</div>
      </div>
    </div>
    <div className="jml8-metrics" aria-live="polite">
      <div><span>DATA POINTS</span><strong>{points.length}</strong></div>
      <div><span>MSE</span><strong>{fmt(errors.mse,1)}</strong></div>
      <div><span>RMSE</span><strong>{fmt(errors.rmse,2)}</strong></div>
      <div><span>R²</span><strong>{errors.r2===null?"N/A":fmt(errors.r2,3)}</strong></div>
    </div>
    <div className="jml8-prediction"><label>NEW INPUT / HOURS <input type="range" min="0" max="10" step="0.1" value={queryX} onChange={(e:ChangeEvent<HTMLInputElement>)=>setQueryX(Number(e.target.value))}/></label><span><strong>{fmt(queryX,1)} h</strong> → predicted <strong>{fmt(prediction,1)} points</strong></span></div>
    <p className="jml8-note" role="status">{status}</p>
    <footer className="jml8-footer"><span>FICTIONAL DATA · NOT A CAUSAL CLAIM</span><span>OLS / BROWSER-SIDE</span></footer>
  </section>;
}
