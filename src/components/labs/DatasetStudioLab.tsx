"use client";

import { useMemo, useState, type MouseEvent } from "react";
import {
  START_PLANTS, boundedNumber, eligibleSamples, fitDataset, predictDataset,
  type Feature, type PlantSample, type Pot, type TrainedDataset,
} from "./dataset-studio-core";
import "./dataset-studio-lab.css";

const GOLD="#ddb782", TEAL="#8cbcb0", MUTED="#858b80";
const GRAPH={width:460,height:231,left:40,right:18,top:18,bottom:32};
const sx=(water:number)=>GRAPH.left+water/5*(GRAPH.width-GRAPH.left-GRAPH.right);
const sy=(sun:number)=>GRAPH.height-GRAPH.bottom-sun/10*(GRAPH.height-GRAPH.top-GRAPH.bottom);
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
const numberText=(n:number|null)=>n===null?"":String(n);
const rowLabel=(healthy:boolean)=>healthy?"Thriving":"Struggling";

export default function DatasetStudioLab(){
  const [rows,setRows]=useState<PlantSample[]>(()=>START_PLANTS.map(row=>({...row})));
  const [features,setFeatures]=useState<Feature[]>(["water","sun"]);
  const [showLabels,setShowLabels]=useState(true);
  const [model,setModel]=useState<TrainedDataset|null>(null);
  const [query,setQuery]=useState({water:2.7,sun:6.6});
  const [newLabel,setNewLabel]=useState(true);
  const [active,setActive]=useState<number|null>(5);

  const valid=useMemo(()=>eligibleSamples(rows,features),[rows,features]);
  const prediction=useMemo(()=>model&&showLabels?predictDataset(model,query):null,[model,query,showLabels]);
  const selectedRow=rows.find(row=>row.id===active);
  const usedIds=new Set(prediction?.neighbors.map(row=>row.id)??[]);
  const plotted=rows.filter(row=>row.water!==null&&row.sun!==null);

  function invalidate(){setModel(null);}
  function editSample(id:number,field:"water"|"sun",raw:string){
    const value=boundedNumber(raw,0,field==="water"?5:10);
    setRows(previous=>previous.map(row=>row.id===id?{...row,[field]:value}:row));invalidate();
  }
  function editPot(id:number,pot:Pot){setRows(previous=>previous.map(row=>row.id===id?{...row,pot}:row));invalidate();}
  function flipLabel(id:number){setRows(previous=>previous.map(row=>row.id===id?{...row,healthy:!row.healthy}:row));invalidate();}
  function toggleFeature(feature:Feature){
    setFeatures(old=>old.includes(feature)?old.filter(item=>item!==feature):[...old,feature]);invalidate();
  }
  function toggleLabels(){setShowLabels(v=>!v);invalidate();}
  function graphClick(event:MouseEvent<SVGSVGElement>){
    const svg=event.currentTarget;
    const box=svg.getBoundingClientRect();
    const x=(event.clientX-box.left)/box.width*GRAPH.width;
    const y=(event.clientY-box.top)/box.height*GRAPH.height;
    setQuery({
      water:Number(clamp((x-GRAPH.left)/(GRAPH.width-GRAPH.left-GRAPH.right)*5,0,5).toFixed(1)),
      sun:Number(clamp((GRAPH.height-GRAPH.bottom-y)/(GRAPH.height-GRAPH.top-GRAPH.bottom)*10,0,10).toFixed(1)),
    });
  }
  function addCurrent(){
    if(rows.length>=30)return;
    const id=rows.reduce((m,r)=>Math.max(m,r.id),0)+1;
    setRows(old=>[...old,{id,water:query.water,sun:query.sun,pot:"Clay",healthy:newLabel}]);
    setActive(id);invalidate();
  }
  function reset(){setRows(START_PLANTS.map(row=>({...row})));setFeatures(["water","sun"]);setShowLabels(true);setModel(null);setQuery({water:2.7,sun:6.6});setNewLabel(true);setActive(5);}

  return <section className="jml3-lab" aria-label="Dataset Studio: data, features, and labels experiment">
    <header className="jml3-header">
      <div><span className="jml3-overline">DATASET STUDIO / EXPERIMENT 003</span><h3>What goes into a model<span>?</span></h3></div>
      <span className="jml3-local"><i/> LOCAL DATA</span>
    </header>
    <div className="jml3-roles" aria-label="Dataset roles">
      <div><small>ROWS / SAMPLES</small><strong>{rows.length}</strong></div>
      <div><small>INPUTS / FEATURES</small><strong>{features.length} selected</strong></div>
      <div><small>OUTPUT / TARGET</small><strong>Plant health</strong></div>
    </div>
    <div className="jml3-column-note"><span>DATA STORY</span> Each row is one fictional plant observation. We record weekly water, daily sunlight, pot material, and whether the plant is thriving. The data is synthetic, not scientific horticultural advice.</div>
    <div className="jml3-workspace">
      <div className="jml3-graph-section">
        <div className="jml3-section-label"><span>01 / VISUALIZE THE SAMPLES</span><span>CLICK TO MOVE THE TEST PLANT</span></div>
        <svg className="jml3-chart" viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`} role="img" aria-label="Scatterplot of water and sunlight for plant observations. Click to change the test point." onClick={graphClick}>
          <rect x={GRAPH.left} y={GRAPH.top} width={GRAPH.width-GRAPH.left-GRAPH.right} height={GRAPH.height-GRAPH.top-GRAPH.bottom} fill="#121511" stroke="#414037"/>
          {[0,1,2,3,4,5].map(v=><g key={`water-${v}`}><line x1={sx(v)} x2={sx(v)} y1={GRAPH.top} y2={GRAPH.height-GRAPH.bottom} stroke="#2e322b" strokeWidth=".8"/><text x={sx(v)} y={GRAPH.height-12} textAnchor="middle" fill="#99978d" fontSize="10">{v}</text></g>)}
          {[0,2,4,6,8,10].map(v=><g key={`sun-${v}`}><line x1={GRAPH.left} x2={GRAPH.width-GRAPH.right} y1={sy(v)} y2={sy(v)} stroke="#2e322b" strokeWidth=".8"/><text x="26" y={sy(v)+4} textAnchor="middle" fill="#99978d" fontSize="10">{v}</text></g>)}
          {plotted.map(sample=> <g key={sample.id} onClick={event=>{event.stopPropagation();setActive(sample.id);}} className="jml3-plot-point" role="button" tabIndex={0} aria-label={`Select sample ${sample.id}`} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();setActive(sample.id);}}}>
            {usedIds.has(sample.id)&&<circle cx={sx(sample.water!)} cy={sy(sample.sun!)} r={12} fill="none" stroke="#e4c58e" strokeWidth="1.5" strokeDasharray="3 2"/>}
            {active===sample.id&&<circle cx={sx(sample.water!)} cy={sy(sample.sun!)} r="10" fill="none" stroke="#f0e9d9" strokeWidth="1" opacity=".75"/>}
            <circle cx={sx(sample.water!)} cy={sy(sample.sun!)} r={6} fill={!showLabels?MUTED:sample.healthy?TEAL:GOLD} stroke="#181a17" strokeWidth="2"/>
            <title>{`Plant #${sample.id} · water ${sample.water} L · sunlight ${sample.sun} h · ${showLabels?rowLabel(sample.healthy):"label hidden"}`}</title>
          </g>)}
          <line x1={sx(query.water)-9} x2={sx(query.water)+9} y1={sy(query.sun)} y2={sy(query.sun)} stroke="#f7efdd" strokeWidth="2"/>
          <line x1={sx(query.water)} x2={sx(query.water)} y1={sy(query.sun)-9} y2={sy(query.sun)+9} stroke="#f7efdd" strokeWidth="2"/>
          <circle cx={sx(query.water)} cy={sy(query.sun)} r={10} stroke="#f7efdd" strokeDasharray="2 3" fill="none" opacity=".75"/>
          <text x={GRAPH.width-12} y={GRAPH.height-11} textAnchor="end" fontSize="10" fill="#b6a385">Water / L per week →</text>
          <text x={GRAPH.left+6} y={GRAPH.top+13} fontSize="10" fill="#b6a385">↑ Sunlight / hours per day</text>
        </svg>
        <div className="jml3-legend"><span><i style={{background:TEAL}}/> Thriving</span><span><i style={{background:GOLD}}/> Struggling</span><span><i style={{background:MUTED}}/> Hidden</span><span className="jml3-cross">＋ New plant</span></div>
        <p className="jml3-tip">The plot always uses both numeric axes. The feature checkboxes control which coordinates the classifier uses.</p>
      </div>
      <div className="jml3-controls">
        <div className="jml3-section-label"><span>02 / SELECT MODEL INPUTS</span></div>
        <div className="jml3-feature-list">
          <label><input type="checkbox" checked={features.includes("water")} onChange={()=>toggleFeature("water")}/><span><b>Water</b><small>Numeric feature · L / week</small></span></label>
          <label><input type="checkbox" checked={features.includes("sun")} onChange={()=>toggleFeature("sun")}/><span><b>Sunlight</b><small>Numeric feature · h / day</small></span></label>
          <div className="jml3-unavailable"><span>Pot material</span><small>Categorical: needs encoding first</small></div>
          <div className="jml3-target"><span>Plant health</span><small>Target label · never an input</small></div>
        </div>
        <label className="jml3-hide"><input type="checkbox" checked={!showLabels} onChange={toggleLabels}/> Hide all target labels</label>
        <div className="jml3-traincount">{features.length===0?"Choose an input feature":`${valid.length} / ${rows.length} rows usable for training`}</div>
        <button type="button" className="jml3-train" disabled={!showLabels||valid.length<3} onClick={()=>setModel(fitDataset(rows,features))}>{model?"Retrain model ↻":"Train on labeled data →"}</button>
        <p className="jml3-notice">{!showLabels?"Without labels, this supervised classifier cannot be trained.":!features.length?"Select at least one numeric feature.":model?`Trained on ${model.samples.length} rows. Change the data to retrain.`:"Ready for training. Editing any row clears the trained snapshot."}</p>
      </div>
    </div>
    <div className="jml3-predict">
      <div className="jml3-predict-head"><span>03 / PREDICT A NEW PLANT</span><small>3-nearest-neighbors · toy classification</small></div>
      <div className="jml3-predict-grid">
        <label>Water / L<input type="number" inputMode="decimal" min="0" max="5" step="0.1" value={numberText(query.water)} onChange={event=>setQuery(old=>({...old,water:boundedNumber(event.target.value,0,5)??0}))}/></label>
        <label>Sunlight / h<input type="number" inputMode="decimal" min="0" max="10" step="0.1" value={numberText(query.sun)} onChange={event=>setQuery(old=>({...old,sun:boundedNumber(event.target.value,0,10)??0}))}/></label>
        <div className="jml3-prediction" aria-live="polite"><small>PREDICTED TARGET</small><strong>{prediction?rowLabel(prediction.healthy):"Train first"}</strong><span>{prediction?`${prediction.healthy?prediction.votes:3-prediction.votes} / 3 neighbors agree`:"No prediction yet"}</span></div>
      </div>
      {prediction&&<div className="jml3-neighbors">Nearest training samples: {prediction.neighbors.map(n=>`#${n.id} (${rowLabel(n.healthy).toLowerCase()})`).join(" · ")}. <strong>These votes are not calibrated probabilities.</strong></div>}
    </div>
    <div className="jml3-table-area">
      <div className="jml3-table-top"><div><span>04 / INSPECT & EDIT THE DATASET</span><small>Select a row, change an input, or flip its label. Train again to see the change.</small></div><button type="button" className="jml3-reset" onClick={reset}>Reset all ↺</button></div>
      <div className="jml3-table-scroll" tabIndex={0} aria-label="Editable plant observations">
        <table className="jml3-table"><thead><tr><th scope="col">Sample</th><th scope="col">Water · L</th><th scope="col">Sun · h</th><th scope="col">Pot · category</th><th scope="col">Target · health</th></tr></thead><tbody>
          {rows.map(row=><tr key={row.id} className={row.id===active?"jml3-active-row":""}>
            <th scope="row"><button type="button" className="jml3-row-index" onClick={()=>setActive(row.id)}>#{String(row.id).padStart(2,"0")}</button></th>
            <td><input aria-label={`Water for sample ${row.id} (liters)`} type="number" step="0.1" min="0" max="5" placeholder="missing" value={numberText(row.water)} onChange={event=>editSample(row.id,"water",event.target.value)}/></td>
            <td><input aria-label={`Sunlight for sample ${row.id} (hours)`} type="number" step="0.1" min="0" max="10" placeholder="missing" value={numberText(row.sun)} onChange={event=>editSample(row.id,"sun",event.target.value)}/></td>
            <td><select aria-label={`Pot material for sample ${row.id}`} value={row.pot} onChange={event=>editPot(row.id,event.target.value as Pot)}>{(["Clay","Plastic","Ceramic"] as Pot[]).map(p=><option key={p}>{p}</option>)}</select></td>
            <td><button type="button" aria-label={`Change health label for sample ${row.id}`} className={`jml3-tag ${row.healthy?"healthy":"struggling"}`} disabled={!showLabels} onClick={()=>flipLabel(row.id)}>{showLabels?rowLabel(row.healthy):"Hidden"}</button></td>
          </tr>)}
        </tbody></table>
      </div>
      <div className="jml3-table-foot"><span>{rows.filter(row=>row.water===null||row.sun===null).length} rows contain missing values</span><span>{selectedRow?`Selected #${selectedRow.id}: one sample / one row`:"Click a row to inspect it"}</span></div>
    </div>
    <div className="jml3-add">
      <label>LABEL FOR NEW SAMPLE<select value={newLabel?"yes":"no"} onChange={event=>setNewLabel(event.target.value==="yes")}><option value="yes">Thriving</option><option value="no">Struggling</option></select></label>
      <button type="button" disabled={rows.length>=30} onClick={addCurrent}>Add test point as labeled sample +</button>
      <small>Uses the test plant's current water and sunlight coordinates. Limit: 30 rows.</small>
    </div>
    <footer className="jml3-footer"><span>DATA → SELECT FEATURES → TRAIN → PREDICT</span><span>ALL COMPUTATION HAPPENS IN YOUR BROWSER</span></footer>
  </section>;
}
