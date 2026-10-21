"use client";

import { useMemo, useState, type MouseEvent } from "react";
import {
  ACTIONS, SIGNAL, START_SAMPLES, assignClusters, blankQ, clusterStep,
  fitMaskedWeight, greedyAction, knn, move, policyPath, predictMasked, trainQ,
  type Label, type Sample, type Vec,
} from "./types-ml-core";
import "./types-ml-lab.css";

type Mode = "supervised" | "unsupervised" | "semi" | "self" | "reinforcement";
const MODES: { id: Mode; number: string; name: string }[] = [
  {id:"supervised",number:"01",name:"Supervised"},
  {id:"unsupervised",number:"02",name:"Unsupervised"},
  {id:"semi",number:"03",name:"Semi-supervised"},
  {id:"self",number:"04",name:"Self-supervised"},
  {id:"reinforcement",number:"05",name:"Reinforcement"},
];
const START_CENTERS=[{x:.25,y:.77},{x:.8,y:.23}];
const POINT_A="#d4ad75", POINT_B="#86b6ad";
const MARGIN=22, W=470,H=268;
const toScreen=(v:Vec)=>({x:MARGIN+v.x*(W-MARGIN*2),y:MARGIN+(1-v.y)*(H-MARGIN*2)});
const panelCopy:Record<Mode,{signal:string, goal:string, explanation:string}>= {
  supervised:{signal:"INPUT / LABELED EXAMPLES",goal:"Learn from answers",explanation:"Give the model examples tagged A or B. A 3-nearest-neighbors model then votes using the closest labeled points."},
  unsupervised:{signal:"INPUT / UNLABELED POINTS",goal:"Discover structure",explanation:"No class answers are provided. K-means assigns each point to a center, then moves centers toward the groups."},
  semi:{signal:"INPUT / A FEW LABELS",goal:"Learn with limited answers",explanation:"Only two examples start labeled. A nearest-labeled-example baseline guesses the others; reveal labels to provide more guidance."},
  self:{signal:"INPUT / UNLABELED SEQUENCE",goal:"Create your own targets",explanation:"Hide observed values and use the original values as training targets. Learn an interpolation rule without hand-written labels."},
  reinforcement:{signal:"INPUT / ACTIONS AND REWARDS",goal:"Discover a useful policy",explanation:"The agent explores a grid. Q-learning updates action values using the rewards from each step, rather than correct answer labels."},
};
const CLASS_NAMES=["A","B"];
const DEFAULT_QUERY={x:.51,y:.48};

function Plot({mode,points,centers,trained,query,k,onPointClick,onBlankClick,selected,labeledIds}: {
  mode:Mode;points:Sample[];centers:Vec[];trained:Sample[]|null;query:Vec;k:number;
  onPointClick:(id:number)=>void;onBlankClick:(p:Vec)=>void;selected:number|null;labeledIds:number[];
}){
  const clusters=assignClusters(points,centers);
  const prediction=mode==="supervised"&&trained?knn(trained,query,k):null;
  const neighbors=new Set(prediction?.neighbors.map(p=>p.id)??[]);
  const labeled=points.filter(p=>labeledIds.includes(p.id));
  const predictedUnlabeled=mode==="semi"?points.map(p=>knn(labeled,p,1)?.label??0):[];
  const onClick=(e:MouseEvent<SVGSVGElement>)=>{
    if(e.target instanceof Element&&e.target.closest("[data-point]"))return;
    const rect=e.currentTarget.getBoundingClientRect();
    // The SVG maintains its aspect ratio even if CSS limits the height.
    // Account for the resulting letterbox, so the click and the plotted point agree.
    const scale=Math.min(rect.width/W,rect.height/H);
    const offsetX=(rect.width-W*scale)/2;
    const offsetY=(rect.height-H*scale)/2;
    const svgX=(e.clientX-rect.left-offsetX)/scale;
    const svgY=(e.clientY-rect.top-offsetY)/scale;
    const x=Math.max(0,Math.min(1,(svgX-MARGIN)/(W-2*MARGIN)));
    const y=Math.max(0,Math.min(1,1-(svgY-MARGIN)/(H-2*MARGIN)));
    onBlankClick({x,y});
  };
  return <svg className="jml-plot" viewBox={`0 0 ${W} ${H}`} role="group"
    aria-label={mode==="unsupervised"?"Scatterplot with k-means centers and unlabeled points":"Scatterplot of 2D examples, labels, and nearest neighbors"} onClick={onClick}>
    <rect width={W} height={H} rx="11" fill="#0c0e0d" />
    {Array.from({length:9},(_,i)=><g key={i} stroke="#2a2b26" strokeWidth=".6">
      <line x1={MARGIN+i*(W-2*MARGIN)/8} y1="0" x2={MARGIN+i*(W-2*MARGIN)/8} y2={H}/>
      <line x1="0" y1={MARGIN+i*(H-2*MARGIN)/8} x2={W} y2={MARGIN+i*(H-2*MARGIN)/8}/>
    </g>)}
    <line x1={MARGIN} x2={W-MARGIN} y1={H-MARGIN} y2={H-MARGIN} stroke="#5c594b" strokeWidth=".8"/>
    <line x1={MARGIN} x2={MARGIN} y1={MARGIN} y2={H-MARGIN} stroke="#5c594b" strokeWidth=".8"/>
    <text x={W-21} y={H-7} fill="#888578" fontSize="10">x</text>
    <text x="9" y="17" fill="#888578" fontSize="10">y</text>
    {prediction?.neighbors.map((p)=>{
      const a=toScreen(p),b=toScreen(query);
      return <line key={p.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d7b47d" opacity=".5" strokeDasharray="4 4" strokeWidth="1.3"/>;
    })}
    {points.map((p,i)=>{
      const s=toScreen(p);
      const isLabeled=mode!=="semi"||labeledIds.includes(p.id);
      const effectiveLabel=mode==="unsupervised"?clusters[i] : mode==="semi"&&!isLabeled?predictedUnlabeled[i]:p.label;
      const color=effectiveLabel===0?POINT_A:POINT_B;
      return <g key={p.id} data-point="true" role="button" tabIndex={0}
        aria-label={`Example ${p.id}${mode==="semi"&&!isLabeled?", unknown label":", category "+CLASS_NAMES[p.label]}`}
        onClick={(e)=>{e.stopPropagation();onPointClick(p.id);}}
        onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onPointClick(p.id);}}}
        className="jml-plot-point">
        {(neighbors.has(p.id)||(mode==="semi"&&selected===p.id))&&<circle cx={s.x} cy={s.y} r="11.5" stroke={selected===p.id?"#f6dfb5":"#c2a274"} strokeWidth="1.5" fill="none"/>}
        <circle cx={s.x} cy={s.y} r="6.5" fill={isLabeled?color:"#272b28"} stroke={color} strokeWidth={isLabeled?1.5:1.4} opacity={isLabeled?1:.85}/>
        {mode==="semi"&&!isLabeled&&<text x={s.x} y={s.y+3} fill="#ddd7cb" textAnchor="middle" fontSize="9">?</text>}
      </g>;
    })}
    {mode==="unsupervised"&&centers.map((c,i)=>{
      const s=toScreen(c);
      return <g key={i}><circle cx={s.x} cy={s.y} r="12" fill="#0b0d0b" stroke={i===0?POINT_A:POINT_B} strokeWidth="2"/>
        <path d={`M${s.x-5} ${s.y}h10 M${s.x} ${s.y-5}v10`} stroke={i===0?POINT_A:POINT_B} strokeWidth="2"/></g>;
    })}
    {mode==="supervised"&&<g pointerEvents="none">
      <circle cx={toScreen(query).x} cy={toScreen(query).y} r="11" fill="#13100d" stroke="#f4d3a4" strokeWidth="2"/>
      <circle cx={toScreen(query).x} cy={toScreen(query).y} r="3.4" fill="#ffdfaa"/>
      <text x={toScreen(query).x+14} y={toScreen(query).y-13} fill="#edd1a8" fontSize="10">NEW</text>
    </g>}
  </svg>;
}

export default function TypesMLLab(){
  const [mode,setMode]=useState<Mode>("supervised");
  const [samples,setSamples]=useState<Sample[]>(START_SAMPLES);
  const [trained,setTrained]=useState<Sample[]|null>(null);
  const [k,setK]=useState(3);
  const [query,setQuery]=useState<Vec>(DEFAULT_QUERY);
  const [centers,setCenters]=useState<Vec[]>(START_CENTERS);
  const [clusterIterations,setClusterIterations]=useState(0);
  const [known,setKnown]=useState<number[]>([1,9]);
  const [selected,setSelected]=useState<number|null>(3);
  const [masked,setMasked]=useState(4);
  const [maskModel,setMaskModel]=useState<{weight:number,count:number}|null>(null);
  const [q,setQ]=useState(blankQ);
  const [episodes,setEpisodes]=useState(0);
  const copy=panelCopy[mode];
  const supervisedResult=useMemo(()=>trained?knn(trained,query,k):null,[trained,query,k]);
  const labelCount=known.length;
  const semiSample=samples.find(p=>p.id===selected);
  const semiGuess=semiSample?knn(samples.filter(p=>known.includes(p.id)),semiSample,1):null;
  const maskPrediction=maskModel?predictMasked(SIGNAL,masked,maskModel.weight):null;
  const path=useMemo(()=>policyPath(q),[q]);
  const reset=()=>{setSamples(START_SAMPLES);setTrained(null);setK(3);setQuery(DEFAULT_QUERY);setCenters(START_CENTERS);setClusterIterations(0);setKnown([1,9]);setSelected(3);setMasked(4);setMaskModel(null);setQ(blankQ());setEpisodes(0);};
  const selectMode=(next:Mode)=>{setMode(next);};
  const pointClick=(id:number)=>{
    if(mode==="supervised"){
      setSamples(old=>old.map(p=>p.id===id?{...p,label:(1-p.label) as Label}:p));
      setTrained(null);
    }else if(mode==="semi"){setSelected(id);}
  };
  const plotBlank=(p:Vec)=>{
    if(mode==="supervised")setQuery(p);
    if(mode==="unsupervised")setSamples(old=>[...old,{id:Math.max(...old.map(x=>x.id))+1,...p,label:0}]);
  };
  const stepClusters=()=>{setCenters(old=>clusterStep(samples,old));setClusterIterations(old=>old+1);};
  const trainEpisodes=(n:number)=>{setQ(old=>trainQ(old,episodes,n));setEpisodes(old=>old+n);};
  const btn=(caption:string,click:()=>void,disabled=false,primary=false)=><button type="button" className={`jml-btn ${primary?"jml-primary":""}`} onClick={click} disabled={disabled}>{caption}</button>;
  return <div className="jml-lab" aria-label="Compare five approaches to machine learning">
    <div className="jml-topline"><span>FIELD GUIDE / FIVE LEARNING SIGNALS</span><span className="jml-live-dot">● <span>LOCAL EXPERIMENT</span></span></div>
    <div className="jml-modes" role="tablist" aria-label="Choose a learning paradigm">
      {MODES.map(tab=><button type="button" key={tab.id} role="tab" aria-selected={mode===tab.id}
        className={`jml-mode ${mode===tab.id?"active":""}`} onClick={()=>selectMode(tab.id)}>
        <small>{tab.number}</small><span>{tab.name}</span>
      </button>)}
    </div>
    <div className="jml-mode-heading"><span>{copy.signal}</span><h3>{copy.goal}<i>.</i></h3><p>{copy.explanation}</p></div>
    {(mode==="supervised"||mode==="unsupervised"||mode==="semi")&&<div className="jml-scatter-area">
      <div className="jml-plot-wrap"><Plot mode={mode} points={samples} centers={centers} trained={trained} query={query} k={k}
        selected={selected} labeledIds={known} onPointClick={pointClick} onBlankClick={plotBlank}/>
        <div className="jml-plot-legend"><span><i style={{background:POINT_A}}/> A</span><span><i style={{background:POINT_B}}/> B</span>
          <span>{mode==="supervised"?"CLICK A DOT TO RELABEL · CLICK EMPTY SPACE TO MOVE QUERY":mode==="unsupervised"?"CLICK SPACE TO ADD A POINT · + MARKS THE CENTERS":"CLICK A POINT TO INSPECT ITS LABEL"}</span></div>
      </div>
      {mode==="supervised"&&<>
        <div className="jml-control-strip"><div className="jml-small-control"><label htmlFor="jml-k">NEIGHBORS / K</label><select id="jml-k" value={k} onChange={e=>setK(Number(e.target.value))}>{[1,3,5,7].map(n=><option key={n} value={n}>{n} nearest</option>)}</select></div>
          {btn(trained?"Retrain on labels ↻":"Learn from labels →",()=>setTrained(samples.map(p=>({...p}))),false,true)}
          {btn("Reset",reset)}</div>
        <div className="jml-result" aria-live="polite"><div><small>WHAT DOES THE MODEL RECEIVE?</small><strong>{samples.length} examples + A/B labels</strong></div>
          {supervisedResult?<div><small>NEW POINT / NEIGHBOR VOTE</small><strong className="jml-highlight">Class {CLASS_NAMES[supervisedResult.label]} · {supervisedResult.votes[supervisedResult.label]}/{supervisedResult.neighbors.length} votes</strong></div>
            :<div><small>MODEL</small><strong>Waiting for training</strong></div>}</div>
      </>}
      {mode==="unsupervised"&&<>
        <div className="jml-control-strip"><div className="jml-small-control"><small>K-MEANS / ITERATION</small><strong>{clusterIterations}</strong></div>
          {btn("Move cluster centers →",stepClusters,false,true)}{btn("Reset",reset)}</div>
        <div className="jml-result" aria-live="polite"><div><small>WHAT DOES THE MODEL RECEIVE?</small><strong>{samples.length} unlabeled positions</strong></div>
          <div><small>CURRENT GROUP SIZES</small><strong className="jml-highlight">{assignClusters(samples,centers).filter(i=>i===0).length} gold · {assignClusters(samples,centers).filter(i=>i===1).length} teal</strong></div></div>
      </>}
      {mode==="semi"&&<>
        <div className="jml-control-strip"><div className="jml-small-control"><small>KNOWN LABELS</small><strong>{labelCount} of {samples.length}</strong></div>
          {btn("Reveal selected label →",()=>{if(selected!==null)setKnown(ids=>ids.includes(selected)?ids:[...ids,selected]);},!selected||known.includes(selected),true)}
          {btn("Reset",reset)}</div>
        <div className="jml-result" aria-live="polite"><div><small>SELECTED EXAMPLE</small><strong>{selected===null?"Choose a point":`#${selected} · ${selected!==null&&known.includes(selected)?"Known label":"Unknown label"}`}</strong></div>
          <div><small>NEAREST-LABELED GUESS</small><strong className="jml-highlight">{semiGuess?`Class ${CLASS_NAMES[semiGuess.label]}`:"No labels yet"}</strong></div></div>
        <p className="jml-note">The dashed-looking unlabeled points are guesses, not ground-truth labels. This is a nearest-labeled baseline, not a full semi-supervised algorithm.</p>
      </>}
    </div>}
    {mode==="self"&&<>
      <div className="jml-signal"><div className="jml-signal-label">OBSERVED SEQUENCE / ONE VALUE IS MASKED</div>
        <div className="jml-bars" aria-label="A series of ten values with one masked">
          {SIGNAL.map((n,i)=><button type="button" key={i} disabled={i===0||i===SIGNAL.length-1} onClick={()=>{setMasked(i);setMaskModel(null);}}
            className={`jml-bar-item ${i===masked?"masked":""}`} aria-label={i===masked?`Position ${i+1}, masked`:`Mask position ${i+1}`}>
            <span className="jml-bar-track"><span className="jml-bar-fill" style={{height:`${n/15*100}%`}}/></span><small>{i===masked?"?":n}</small>
          </button>)}
        </div>
      </div>
      <div className="jml-control-strip"><div className="jml-small-control"><small>MASKED POSITION</small><strong>{masked+1} / {SIGNAL.length}</strong></div>
        {btn("Train on generated masks →",()=>setMaskModel(fitMaskedWeight(SIGNAL,masked)),false,true)}{btn("Reset",reset)}</div>
      <div className="jml-result" aria-live="polite"><div><small>AUTOMATIC TRAINING TARGETS</small><strong>{maskModel?.count??SIGNAL.length-3} other hidden positions</strong></div>
        <div><small>HELD-OUT PREDICTION</small><strong className="jml-highlight">{maskPrediction===null?"Train to predict":`${maskPrediction.toFixed(2)} vs actual ${SIGNAL[masked]}`}</strong></div></div>
      <p className="jml-note">We create training examples by masking each observed interior value. A one-parameter interpolation model learns to reconstruct it from the neighbors. The selected position is excluded from training.</p>
    </>}
    {mode==="reinforcement"&&<>
      <div className="jml-grid-wrap"><div className="jml-grid-board" role="img" aria-label="4 by 4 gridworld, start upper-left, hazard at row two column two, reward at lower-right">
        {Array.from({length:16},(_,state)=>{
          const hazard=state===5,goal=state===15,start=state===0;
          const onPath=path.includes(state)&&episodes>0;
          return <div key={state} className={`jml-grid-cell ${hazard?"danger":""} ${goal?"goal":""} ${onPath?"path":""}`}>
            <small>{start?"START":hazard?"−1":goal?"+1":""}</small>
            <span>{hazard?"✕":goal?"★":episodes===0?"·":ACTIONS[greedyAction(q[state])]}</span>
          </div>;
        })}
      </div><div className="jml-grid-guide"><strong>THE GRIDWORLD</strong><p>Each step costs <b>−0.04</b>. Landing on the hazard ends the episode with <b>−1</b>; reaching the star gives <b>+1</b>.</p>
        <p>The agent learns action values from repeated attempts. Follow the arrows to inspect its current greedy policy.</p></div></div>
      <div className="jml-control-strip"><div className="jml-small-control"><small>TRAINING EPISODES</small><strong>{episodes}</strong></div>
        {btn("Train 1",()=>trainEpisodes(1))}{btn("Train 100 →",()=>trainEpisodes(100),false,true)}{btn("Reset",reset)}</div>
      <div className="jml-result" aria-live="polite"><div><small>TYPE OF FEEDBACK</small><strong>Rewards & penalties, no correct moves</strong></div>
        <div><small>GREEDY PATH FROM START</small><strong className="jml-highlight">{episodes===0?"Train to discover a route":path.at(-1)===15?`Goal reached in ${path.length-1} moves`:`Incomplete after ${path.length-1} moves`}</strong></div></div>
      <p className="jml-note">This is a tiny Q-learning demonstration (learning rate 0.22, discount 0.93, exploration). Small training runs can produce imperfect policies.</p>
    </>}
    <div className="jml-footer"><span>MODEL EXPERIMENT / NO SERVER</span><span>SELECT A DIFFERENT TAB TO COMPARE ↗</span></div>
  </div>;
}
