"use client";

import { useId, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  clamp,compareDegrees,evaluate,fitPolynomial,format,makeDataset,predict,targetFunction,
  type Comparison,type PolyModel,type Sample,type Scenario,
} from "./polynomial-regression-core";
import "./polynomial-regression-lab.css";

const GRAPH={width:480,height:258,left:42,right:14,top:12,bottom:37};
const XMIN=-1.04,XMAX=1.04,YMIN=-2.45,YMAX=2.45;
const px=(x:number)=>GRAPH.left+(x-XMIN)/(XMAX-XMIN)*(GRAPH.width-GRAPH.left-GRAPH.right);
const py=(y:number)=>GRAPH.height-GRAPH.bottom-(y-YMIN)/(YMAX-YMIN)*(GRAPH.height-GRAPH.top-GRAPH.bottom);
const DEGREES=[1,2,3,4,5,6,7,8,9] as const;
const curvePath=(f:(x:number)=>number)=>Array.from({length:151},(_,i)=>{
  const x=-1+2*i/150, y=f(x);
  if(!Number.isFinite(y))return "";
  return `${i===0?"M":"L"}${px(x).toFixed(2)},${py(clamp(y,-100,100)).toFixed(2)}`;
}).filter(Boolean).join(" ");

type Dragging={id:number;pointerId:number}|null;
export default function PolynomialRegressionLab(){
  const clipId=useId().replace(/:/g,"");
  const [scenario,setScenario]=useState<Scenario>("quadratic");
  const [sampleCount,setSampleCount]=useState<12|24|48>(24);
  const [noise,setNoise]=useState(0.25);
  const [seed,setSeed]=useState(0);
  const [degree,setDegree]=useState(2);
  const [overrides,setOverrides]=useState<Record<number,number>>({});
  const [model,setModel]=useState<PolyModel|null>(null);
  const [comparisons,setComparisons]=useState<Comparison[]>([]);
  const [locked,setLocked]=useState(false);
  const [showTruth,setShowTruth]=useState(false);
  const [showResiduals,setShowResiduals]=useState(true);
  const [showValidation,setShowValidation]=useState(false);
  const [selected,setSelected]=useState(1);
  const dragging=useRef<Dragging>(null);

  const base=useMemo(()=>makeDataset(scenario,sampleCount,noise,seed),[scenario,sampleCount,noise,seed]);
  const train=useMemo(()=>base.train.map(p=>({...p,y:overrides[p.id]??p.y})),[base,overrides]);
  const validation=base.validation;
  const test=base.test;
  const trainMetrics=model?evaluate(train,model):null;
  const validMetrics=model?evaluate(validation,model):null;
  const testMetrics=locked&&model?evaluate(test,model):null;
  const selectedRow=train.find(p=>p.id===selected)??train[0];
  const currentResult=useMemo(()=>fitPolynomial(train,degree),[train,degree]);
  const best=useMemo(()=>comparisons.length?comparisons.reduce((a,b)=>a.validationRMSE<=b.validationRMSE?a:b):null,[comparisons]);

  function invalidate(){setModel(null);setComparisons([]);setLocked(false);}
  function changeScenario(v:Scenario){setScenario(v);setOverrides({});setSelected(1);invalidate();}
  function changeSampleCount(v:12|24|48){setSampleCount(v);setOverrides({});setSelected(1);invalidate();}
  function changeNoise(v:number){setNoise(v);setOverrides({});invalidate();}
  function newDataset(){setSeed(old=>old+1);setOverrides({});setLocked(false);setModel(null);setComparisons([]);setSelected(1);setShowValidation(false);}
  function changeDegree(v:number){if(locked)return;setDegree(v);setModel(null);}
  function trainChosen(){if(locked)return;const result=fitPolynomial(train,degree);if(result.ok)setModel(result.model);}
  function chooseCompared(item:Comparison){if(locked)return;setDegree(item.degree);setModel(item.model);}

  function graphY(event:PointerEvent<SVGCircleElement>){
    const svg=event.currentTarget.ownerSVGElement;
    if(!svg)return null;
    const rect=svg.getBoundingClientRect();
    const position=((event.clientY-rect.top)/rect.height)*GRAPH.height;
    return clamp(YMAX-(position-GRAPH.top)/(GRAPH.height-GRAPH.top-GRAPH.bottom)*(YMAX-YMIN),-2.4,2.4);
  }
  function startDrag(event:PointerEvent<SVGCircleElement>,point:Sample){
    if(locked)return;
    dragging.current={id:point.id,pointerId:event.pointerId};
    setSelected(point.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event:PointerEvent<SVGCircleElement>){
    if(!dragging.current||dragging.current.pointerId!==event.pointerId||locked)return;
    const id=dragging.current.id;
    const y=graphY(event);
    if(y===null)return;
    setOverrides(prev=>({...prev,[id]:Math.round(y*1000)/1000}));
    setModel(null);setComparisons([]);
  }
  function endDrag(event:PointerEvent<SVGCircleElement>){
    if(dragging.current?.pointerId===event.pointerId)dragging.current=null;
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <section className="jml12" aria-label="Polynomial regression studio">
    <header className="jml12-head">
      <div><span className="jml12-eyebrow">EXPERIMENT 012 / POLYNOMIAL REGRESSION</span><h3>Make the line <em>bend.</em></h3></div>
      <span className="jml12-live"><i/> ACTUAL LEAST SQUARES</span>
    </header>
    <div className="jml12-model-line">
      <span>{model?"FITTED POLYNOMIAL":"POLYNOMIAL FEATURE SPACE"}</span>
      <strong>{model?`ŷ = ${model.coefficients.map((coefficient,k)=>`${coefficient<0?(k===0?"−":" − "):(k===0?"":" + ")}${format(Math.abs(coefficient),2)}${k===0?"":k===1?"x":`x^${k}`}`).join("")}`:`ŷ = θ₀ + θ₁x + … + θ${degree}x^${degree}`}</strong>
      <small>{model?`DEGREE ${model.degree} · FITTED TO TRAINING ONLY`:"PRESS FIT MODEL TO ESTIMATE COEFFICIENTS"}</small>
    </div>

    <div className="jml12-main">
      <div className="jml12-plot-area">
        <div className="jml12-section-heading"><span>01 / DATA & FITTED CURVE</span><span>{train.length} TRAIN · {validation.length} VALIDATION</span></div>
        <svg viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`} className="jml12-plot" role="group" aria-label="Scatterplot showing training points and the fitted polynomial regression curve. Drag training observations vertically to change their targets.">
          <defs><clipPath id={clipId}><rect x={GRAPH.left} y={GRAPH.top} width={GRAPH.width-GRAPH.left-GRAPH.right} height={GRAPH.height-GRAPH.top-GRAPH.bottom}/></clipPath></defs>
          {[-1,-.5,0,.5,1].map(t=><g key={`x${t}`}>
            <line x1={px(t)} x2={px(t)} y1={GRAPH.top} y2={GRAPH.height-GRAPH.bottom} stroke="#323a31" strokeWidth=".8"/>
            <text x={px(t)} y={GRAPH.height-GRAPH.bottom+17} textAnchor="middle" fontSize="11" fill="#aaa08e">{t}</text>
          </g>)}
          {[-2,-1,0,1,2].map(t=><g key={`y${t}`}>
            <line x1={GRAPH.left} x2={GRAPH.width-GRAPH.right} y1={py(t)} y2={py(t)} stroke="#323a31" strokeWidth=".8"/>
            <text x={GRAPH.left-10} y={py(t)+4} textAnchor="end" fontSize="11" fill="#aaa08e">{t}</text>
          </g>)}
          <g clipPath={`url(#${clipId})`}>
            {showTruth&&<path d={curvePath(x=>targetFunction(x,scenario))} stroke="#87a8a1" strokeWidth="1.8" strokeDasharray="7 4" fill="none"/>}
            {model&&<path d={curvePath(x=>predict(model,x))} stroke="#f0c48a" strokeWidth="2.8" fill="none"/>}
            {model&&showResiduals&&train.map(p=><line key={`r${p.id}`} x1={px(p.x)} x2={px(p.x)} y1={py(p.y)} y2={py(clamp(predict(model,p.x),YMIN,YMAX))} stroke="#a78254" strokeWidth="1.35" strokeDasharray="2.5 2.5"/>)}
            {showValidation&&validation.map(p=><circle key={`v${p.id}`} cx={px(p.x)} cy={py(p.y)} r="3.6" fill="#8fbfb6" opacity=".72"/>)}
            {locked&&test.map(p=><circle key={`t${p.id}`} cx={px(p.x)} cy={py(p.y)} r="3.8" fill="none" stroke="#c5a1d8" strokeWidth="1.6"/>)}
            {train.map(p=><circle key={p.id} cx={px(p.x)} cy={py(p.y)} r={p.id===selected?6:4.8} stroke={p.id===selected?"#fff5df":"#1e241b"} strokeWidth="1.5" fill="#e4bd7f" tabIndex={locked?-1:0} role="button" aria-label={`Drag training example ${p.id}, x=${format(p.x,2)}, y=${format(p.y,2)}`} onPointerDown={e=>startDrag(e,p)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={e=>{if(locked)return;if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();setSelected(p.id);setOverrides(prev=>({...prev,[p.id]:clamp((prev[p.id]??p.y)+(e.key==="ArrowUp"?.1:-.1),-2.4,2.4)}));setModel(null);setComparisons([]);}}} className={locked?"":"jml12-draggable"}/>)}
          </g>
          <text x={GRAPH.width/2} y={GRAPH.height-2} textAnchor="middle" fill="#bcb2a2" fontSize="10">NORMALIZED FEATURE x →</text>
          <text transform={`translate(12 ${GRAPH.height/2}) rotate(-90)`} textAnchor="middle" fill="#bcb2a2" fontSize="10">TARGET y →</text>
        </svg>
        <div className="jml12-legend"><span><i className="jml12-dot-gold"/> TRAINING</span><span><i className="jml12-dot-teal"/> VALIDATION</span><span><i className="jml12-dot-violet"/> TEST (SEALED)</span></div>
        <div className="jml12-flags">
          <label><input type="checkbox" checked={showResiduals} onChange={e=>setShowResiduals(e.target.checked)}/> Residual lines</label>
          <label><input type="checkbox" checked={showTruth} onChange={e=>setShowTruth(e.target.checked)}/> True synthetic function</label>
          <label><input type="checkbox" checked={showValidation} onChange={e=>setShowValidation(e.target.checked)}/> Validation points</label>
        </div>
        <div className="jml12-selected"><span>SELECTED TRAINING POINT #{selectedRow.id}</span><div>x = <b>{format(selectedRow.x,2)}</b> · actual y = <b>{format(selectedRow.y,2)}</b> {model&&<>· prediction = <b>{format(predict(model,selectedRow.x),2)}</b></>}</div><small>{locked?"Final model locked. Start a new dataset to experiment again.":"Drag a gold point up or down, or use ↑/↓ while it is focused. Refit afterward."}</small></div>
      </div>
      <div className="jml12-controls">
        <div className="jml12-section-heading"><span>02 / EXPERIMENT SETUP</span></div>
        <label className="jml12-select"><span>UNDERLYING PATTERN</span><select disabled={locked} value={scenario} onChange={e=>changeScenario(e.target.value as Scenario)}>
          <option value="quadratic">Curved / quadratic</option><option value="linear">Straight / linear</option><option value="cubic">S-shaped / cubic</option><option value="outlier">Quadratic + outlier</option>
        </select></label>
        <label className="jml12-select"><span>POLYNOMIAL DEGREE</span><select disabled={locked} value={degree} onChange={e=>changeDegree(Number(e.target.value))}>
          {DEGREES.map(d=><option key={d} value={d}>Degree {d} ({d+1} parameters)</option>)}
        </select></label>
        <label className="jml12-range"><span>NOISE <output>{format(noise,2)}</output></span><input disabled={locked} type="range" min="0" max="0.8" step="0.05" value={noise} onChange={e=>changeNoise(Number(e.target.value))}/></label>
        <label className="jml12-select"><span>TRAINING SAMPLES</span><select disabled={locked} value={sampleCount} onChange={e=>changeSampleCount(Number(e.target.value) as 12|24|48)}><option value={12}>12 samples</option><option value={24}>24 samples</option><option value={48}>48 samples</option></select></label>
        <div className="jml12-action-row"><button type="button" onClick={trainChosen} disabled={locked||!currentResult.ok} className="jml12-primary">Fit selected degree ↗</button><button type="button" onClick={newDataset} className="jml12-secondary">↻ New dataset</button></div>
        {!currentResult.ok&&<p className="jml12-warning" role="alert">{"reason" in currentResult ? currentResult.reason : "Fit unavailable"}</p>}
        <div className="jml12-hint"><strong>What does “degree” do?</strong> Higher degrees add extra input columns x², x³, and so on. The fit still finds *linear coefficients* using least squares.</div>
        <button type="button" className="jml12-compare-button" disabled={locked} onClick={()=>setComparisons(compareDegrees(train,validation))}>Compare degrees 1–9 on validation →</button>
      </div>
    </div>

    <div className="jml12-metrics" aria-label="Regression errors"><div><span>TRAIN RMSE</span><strong>{trainMetrics?format(trainMetrics.rmse):"—"}</strong><small>fit on training only</small></div><div><span>VALIDATION RMSE</span><strong>{validMetrics?format(validMetrics.rmse):"—"}</strong><small>not used in fitting</small></div><div><span>TRAIN MAE</span><strong>{trainMetrics?format(trainMetrics.mae):"—"}</strong><small>absolute error</small></div><div><span>TEST RMSE</span><strong>{testMetrics?format(testMetrics.rmse):"LOCKED"}</strong><small>{locked?"one final evaluation":"sealed until commit"}</small></div></div>

    <div className="jml12-comparison">
      <div className="jml12-section-heading"><span>03 / MODEL COMPLEXITY CHECK</span><span>TRAINING AND VALIDATION ERROR</span></div>
      {comparisons.length===0?<p>Use <b>Compare degrees</b> to fit nine separate models using the same training partition. Compare their validation errors before selecting a final model.</p>:<>
        <div className="jml12-compare-table" role="table" aria-label="Polynomial degree comparison">
          <div className="jml12-compare-head" role="row"><span>DEGREE</span><span>TRAIN RMSE</span><span>VALID RMSE</span><span>SELECT</span></div>
          {comparisons.map(row=><div className={`jml12-compare-row${row.degree===degree?" jml12-compare-active":""}`} role="row" key={row.degree}><span>{row.degree}{best?.degree===row.degree?" ★":""}</span><span>{format(row.trainingRMSE)}</span><span>{format(row.validationRMSE)}</span><button disabled={locked} type="button" onClick={()=>chooseCompared(row)}>{row.degree===degree&&model?"Chosen":"Use"}</button></div>)}
        </div>
        <p>★ Lowest validation RMSE in this particular synthetic split. It is not a guarantee about unseen data. This is a <b>complexity comparison</b>, not a learning curve against training-set size.</p>
      </>}
    </div>
    <div className="jml12-final">
      <div><span>04 / ONE-TIME FINAL TEST</span><p>Choose a degree using the validation results, fit it, and reveal its <b>previously unseen test score</b>. After revealing it, the model and dataset are locked. Start a new dataset for another experiment.</p></div>
      <button type="button" className="jml12-primary" disabled={!model||locked} onClick={()=>setLocked(true)}>{locked?"Test revealed ✓":"Commit & reveal test"}</button>
      {locked&&testMetrics&&<output aria-live="polite">Test RMSE: <strong>{format(testMetrics.rmse)}</strong></output>}
    </div>
    <footer className="jml12-footer"><span>SYNTHETIC DATA · FEATURE x IS ALREADY NORMALIZED</span><span>TRAIN / VALIDATE / TEST REMAIN SEPARATE</span></footer>
  </section>;
}
