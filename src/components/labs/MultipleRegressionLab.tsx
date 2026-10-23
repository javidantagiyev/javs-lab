"use client";

import {useId,useMemo,useState} from "react";
import {
  INITIAL_FEATURES,INITIAL_MODEL,correlation,dataFor,fitOLS,format,metrics,predict,
  type Apartment,type Features,type Model,type Scenario,
} from "./multiple-regression-core";
import "./multiple-regression-lab.css";

const CHART={w:478,h:254,l:47,r:18,t:15,b:39};
const domain={min:0,max:350};
const xScale=(n:number)=>CHART.l+(n-domain.min)/(domain.max-domain.min)*(CHART.w-CHART.l-CHART.r);
const yScale=(n:number)=>CHART.h-CHART.b-(n-domain.min)/(domain.max-domain.min)*(CHART.h-CHART.t-CHART.b);
const signed=(n:number)=>`${n<0?"−":"+"} ${format(Math.abs(n),2)}`;

export default function MultipleRegressionLab(){
  const clipId=useId().replace(/:/g,"");
  const [scenario,setScenario]=useState<Scenario>("balanced");
  const [features,setFeatures]=useState<Features>({...INITIAL_FEATURES});
  const [manual,setManual]=useState<Model>({...INITIAL_MODEL});
  const [fitted,setFitted]=useState(false);
  const [showResiduals,setShowResiduals]=useState(true);
  const [showHoldout,setShowHoldout]=useState(false);
  const [queryArea,setQueryArea]=useState(98);
  const [queryAge,setQueryAge]=useState(12);
  const [selectedId,setSelectedId]=useState(1);
  const {train,holdout}=useMemo(()=>dataFor(scenario),[scenario]);
  const solution=useMemo(()=>fitOLS(train,features),[train,features]);
  const useFit=fitted&&solution.unique;
  const model=useFit?solution.model:{
    intercept:manual.intercept,
    area:features.area?manual.area:0,
    age:features.age?manual.age:0,
  };
  const trainResult=useMemo(()=>metrics(train,model),[train,model]);
  const holdoutResult=useMemo(()=>metrics(holdout,model),[holdout,model]);
  const corr=useMemo(()=>correlation(train),[train]);
  const selected=train.find(r=>r.id===selectedId)??train[0];
  const selectedPrediction=predict(model,selected.area,selected.age);
  const queryPrediction=predict(model,queryArea,queryAge);
  const chartRows:({r:Apartment;holdout:boolean})[]=[
    ...train.map(r=>({r,holdout:false})),
    ...(showHoldout?holdout.map(r=>({r,holdout:true})):[]),
  ];

  function choosePreset(value:Scenario){
    setScenario(value);setFitted(false);setSelectedId(1);setShowHoldout(false);
  }
  function chooseFeature(field:keyof Features){
    setFeatures(previous=>({...previous,[field]:!previous[field]}));
    setFitted(false);
  }
  function changeCoefficient(field:keyof Model,value:number){
    setManual(previous=>({...previous,[field]:value}));setFitted(false);
  }
  function reset(){
    setScenario("balanced");setFeatures({...INITIAL_FEATURES});setManual({...INITIAL_MODEL});
    setFitted(false);setShowResiduals(true);setShowHoldout(false);
    setQueryArea(98);setQueryAge(12);setSelectedId(1);
  }

  return <section className="jml11-lab" aria-label="Multiple linear regression studio">
    <header className="jml11-header">
      <div><span className="jml11-kicker">EXPERIMENT 011 / REGRESSION</span><h3>Two features. <em>One prediction.</em></h3></div>
      <span className="jml11-live"><i/> REAL LEAST SQUARES</span>
    </header>
    <div className="jml11-equation"><span>LIVE MODEL</span><strong>ŷ = {format(model.intercept,1)} {features.area?signed(model.area)+" × area":""} {features.age?signed(model.age)+" × age":""}</strong><small>{useFit?"TRAINING-FIT PARAMETERS":"MANUAL PARAMETERS"}</small></div>

    <div className="jml11-layout">
      <div className="jml11-chart-panel">
        <div className="jml11-minor-heading"><span>01 / OBSERVED VS PREDICTED</span><span>{train.length} TRAIN · {holdout.length} HOLDOUT</span></div>
        <svg viewBox={`0 0 ${CHART.w} ${CHART.h}`} role="img" aria-label="Scatterplot of actual and predicted apartment prices; dotted residual lines show differences from a perfect prediction" className="jml11-chart">
          <defs><clipPath id={clipId}><rect x={CHART.l} y={CHART.t} width={CHART.w-CHART.l-CHART.r} height={CHART.h-CHART.t-CHART.b}/></clipPath></defs>
          {[0,50,100,150,200,250,300,350].map(t=><g key={t}>
            <line x1={xScale(t)} x2={xScale(t)} y1={CHART.t} y2={CHART.h-CHART.b} stroke="#35382f" strokeWidth=".8"/>
            <line x1={CHART.l} x2={CHART.w-CHART.r} y1={yScale(t)} y2={yScale(t)} stroke="#35382f" strokeWidth=".8"/>
            <text x={xScale(t)} y={CHART.h-CHART.b+16} fill="#988f7f" fontSize="10" textAnchor="middle">{t}</text>
            <text x={CHART.l-10} y={yScale(t)+3.5} fill="#988f7f" fontSize="10" textAnchor="end">{t}</text>
          </g>)}
          <g clipPath={`url(#${clipId})`}>
            <line x1={xScale(0)} x2={xScale(350)} y1={yScale(0)} y2={yScale(350)} stroke="#a3ac9f" strokeDasharray="6 5" strokeWidth="1.6"/>
            {chartRows.map(({r,holdout:external})=>{
              const predicted=predict(model,r.area,r.age);
              const x=xScale(r.price),y=yScale(predicted),ideal=yScale(r.price);
              return <g key={r.id}>
                {showResiduals&&<line x1={x} x2={x} y1={ideal} y2={y} stroke={external?"#6fa8a8":"#af8c5d"} strokeDasharray="3 3" strokeWidth="1.7"/>}
                <circle cx={x} cy={y} r={selectedId===r.id&&!external?5.7:4.1} fill={external?"#9ec7bd":"#d8b57d"} stroke={selectedId===r.id&&!external?"#fff5dc":"#141811"} strokeWidth="1.5"/>
                {!external&&<circle cx={x} cy={y} r="11" fill="transparent" role="button" tabIndex={0} aria-label={`Inspect example ${r.id}: ${r.area} square metres, ${r.age} years old`} onClick={()=>setSelectedId(r.id)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelectedId(r.id);}}}/>} 
              </g>;
            })}
          </g>
          <text x={CHART.w/2+8} y={CHART.h-3} fontSize="10" fill="#bcb0a0" textAnchor="middle">ACTUAL PRICE · thousand AZN →</text>
          <text transform={`translate(12 ${CHART.h/2}) rotate(-90)`} fill="#bcb0a0" fontSize="10" textAnchor="middle">PREDICTED →</text>
        </svg>
        <div className="jml11-legend"><span><i className="jml11-gold-dot"/> TRAIN</span><span><i className="jml11-aqua-dot"/> HOLDOUT</span><span><i className="jml11-perfect"/> PERFECT PREDICTION</span></div>
        <div className="jml11-chart-toggles">
          <label><input type="checkbox" checked={showResiduals} onChange={e=>setShowResiduals(e.target.checked)}/> Show residuals</label>
          <label><input type="checkbox" checked={showHoldout} onChange={e=>setShowHoldout(e.target.checked)}/> Show holdout points</label>
        </div>
        <div className="jml11-example"><span>SELECTED TRAINING ROW #{selected.id}</span><div>{selected.area} m² · {selected.age} years · actual <b>{format(selected.price,1)}k</b> · predicted <b>{format(selectedPrediction,1)}k</b></div><small>Residual = {format(selected.price-selectedPrediction,1)} thousand AZN</small></div>
      </div>

      <div className="jml11-controls">
        <div className="jml11-minor-heading"><span>02 / MODEL CONTROLS</span></div>
        <label className="jml11-select"><span>DATASET SCENARIO</span><select value={scenario} onChange={e=>choosePreset(e.target.value as Scenario)}>
          <option value="balanced">Mixed area + age</option><option value="correlated">Correlated features</option><option value="outlier">Unusual price / outlier</option>
        </select></label>
        <div className="jml11-checklist"><span>INPUT FEATURES</span>
          <label><input type="checkbox" checked={features.area} onChange={()=>chooseFeature("area")}/> Area (m²)</label>
          <label><input type="checkbox" checked={features.age} onChange={()=>chooseFeature("age")}/> Building age (years)</label>
        </div>
        <div className="jml11-ranges"><span>MANUAL COEFFICIENTS</span>
          <label>Intercept <output>{format(manual.intercept,1)}</output><input type="range" min="-30" max="100" step="1" value={manual.intercept} onChange={e=>changeCoefficient("intercept",Number(e.target.value))}/></label>
          <label className={!features.area?"jml11-disabled":""}>Area weight <output>{format(manual.area,2)}</output><input type="range" min="0" max="3.4" step="0.05" value={manual.area} disabled={!features.area} onChange={e=>changeCoefficient("area",Number(e.target.value))}/></label>
          <label className={!features.age?"jml11-disabled":""}>Age weight <output>{format(manual.age,2)}</output><input type="range" min="-2.5" max="1.5" step="0.05" value={manual.age} disabled={!features.age} onChange={e=>changeCoefficient("age",Number(e.target.value))}/></label>
        </div>
        <button type="button" className="jml11-primary" onClick={()=>setFitted(true)} disabled={!solution.unique}>Fit ordinary least squares ↗</button>
        <button type="button" className="jml11-secondary" onClick={reset}>↻ Reset experiment</button>
        {!solution.unique&&<p className="jml11-warning" role="status">{solution.reason}</p>}
        {corr!==null&&Math.abs(corr)>0.92&&features.area&&features.age&&<p className="jml11-warning">Strong correlation between features ({format(corr,2)}). Coefficients can be sensitive to small data changes.</p>}
      </div>
    </div>

    <div className="jml11-metrics" aria-label="Regression evaluation metrics">
      <div><span>TRAIN RMSE</span><strong>{format(trainResult.rmse,1)}</strong><small>thousand AZN</small></div>
      <div><span>HOLDOUT RMSE</span><strong>{format(holdoutResult.rmse,1)}</strong><small>thousand AZN</small></div>
      <div><span>TRAIN R²</span><strong>{trainResult.r2===null?"N/A":format(trainResult.r2,3)}</strong><small>coefficient of determination</small></div>
      <div><span>AREA–AGE r</span><strong>{corr===null?"N/A":format(corr,2)}</strong><small>Pearson correlation</small></div>
    </div>
    <div className="jml11-prediction">
      <div className="jml11-minor-heading"><span>03 / WHAT-IF PREDICTION</span><span>CHANGE ONE INPUT WHILE FIXING THE OTHER</span></div>
      <div className="jml11-query-controls">
        <label>Area <output>{queryArea} m²</output><input type="range" min="40" max="165" step="1" value={queryArea} onChange={e=>setQueryArea(Number(e.target.value))}/></label>
        <label>Building age <output>{queryAge} years</output><input type="range" min="0" max="45" step="1" value={queryAge} onChange={e=>setQueryAge(Number(e.target.value))}/></label>
        <div className="jml11-query-result"><span>ESTIMATED PRICE</span><strong>{format(queryPrediction,1)}k <small>AZN</small></strong></div>
      </div>
      <p>Prediction = {format(model.intercept,1)} (intercept) {features.area?`${signed(model.area*queryArea)} (area contribution)`:""} {features.age?`${signed(model.age*queryAge)} (age contribution)`:""}.</p>
    </div>
    <footer className="jml11-footer"><span>FICTIONAL DATA · NOT PROPERTY VALUATION ADVICE</span><span>14 TRAIN + 4 HOLDOUT · FIT NEVER SEES HOLDOUT</span></footer>
  </section>;
}
