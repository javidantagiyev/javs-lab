/** Jav's Lab 007 — deterministic, browser-only preprocessing and 3-NN demonstration. */
export type Zone = "Center" | "Suburb" | "Coast" | "Hills";
export type Example = {
  id: string;
  split: "train" | "validation";
  area: number;
  age: number | null;
  zone: Zone;
  price: number; // synthetic price in thousand AZN
};
export type MissingStrategy = "median" | "mean" | "drop";
export type Scaling = "none" | "minmax" | "standard";
export type Configuration = { missing: MissingStrategy; scaling: Scaling; encode: boolean; leak: boolean };
export type Statistics = {
  ageFill: number | null;
  ageAverage: number;
  areaMin: number;
  areaMax: number;
  areaMean: number;
  areaSD: number;
  ageMin: number;
  ageMax: number;
  ageMean: number;
  ageSD: number;
  zones: Zone[];
  fitRowCount: number;
};
export type PreparedExample = Example & { filledAge: number; vector: number[] };
export type Prediction = { id: string; actual: number; predicted: number; error: number; neighbors: string[] };
export type PipelineResult = {
  stats: Statistics;
  columns: string[];
  train: PreparedExample[];
  validation: PreparedExample[];
  skippedTrain: number;
  skippedValidation: number;
  unseenZones: string[];
  predictions: Prediction[];
  mae: number | null;
};

export const ORIGINAL_ROWS: Example[] = [
  {id:"T01",split:"train",area:45,age:32,zone:"Suburb",price:98},
  {id:"T02",split:"train",area:62,age:26,zone:"Suburb",price:132},
  {id:"T03",split:"train",area:78,age:null,zone:"Center",price:231},
  {id:"T04",split:"train",area:95,age:18,zone:"Coast",price:245},
  {id:"T05",split:"train",area:56,age:38,zone:"Center",price:188},
  {id:"T06",split:"train",area:105,age:12,zone:"Center",price:296},
  {id:"T07",split:"train",area:88,age:null,zone:"Coast",price:235},
  {id:"T08",split:"train",area:70,age:30,zone:"Suburb",price:145},
  {id:"T09",split:"train",area:120,age:7,zone:"Coast",price:320},
  {id:"T10",split:"train",area:52,age:22,zone:"Coast",price:150},
  {id:"V01",split:"validation",area:85,age:14,zone:"Center",price:252},
  {id:"V02",split:"validation",area:150,age:2,zone:"Hills",price:310},
  {id:"V03",split:"validation",area:64,age:null,zone:"Suburb",price:148},
  {id:"V04",split:"validation",area:140,age:1,zone:"Coast",price:355},
];
export const DEFAULT_CONFIG: Configuration = {missing:"median",scaling:"standard",encode:true,leak:false};
const average = (numbers:number[]) => numbers.reduce((sum,n)=>sum+n,0)/numbers.length;
const stddev = (numbers:number[], mean:number) => Math.sqrt(average(numbers.map(n=>(n-mean)**2))) || 1;
const median = (numbers:number[]) => {
  const sorted=[...numbers].sort((a,b)=>a-b); const mid=Math.floor(sorted.length/2);
  return sorted.length%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
};
const finite = (n: number) => Number.isFinite(n);
function summarize(fitRows:Example[], configuration:Configuration): Statistics {
  if(!fitRows.length) throw new Error("No rows available to fit the preprocessing pipeline.");
  const usableAges=fitRows.map(r=>r.age).filter((n):n is number => n!==null&&finite(n));
  if(!usableAges.length) throw new Error("No observed ages are available for imputation.");
  const ageFill=configuration.missing==="drop" ? null : configuration.missing==="median" ? median(usableAges) : average(usableAges);
  // A scaler is fitted AFTER missing-value imputation, just like a sequential pipeline.
  const normalized = fitRows.filter(r=>configuration.missing!=="drop" || r.age!==null);
  if(!normalized.length) throw new Error("Dropping missing ages leaves no data for fitting.");
  const areas=normalized.map(r=>r.area);
  const ages=normalized.map(r=>r.age ?? ageFill ?? 0);
  const areaMean=average(areas), ageMean=average(ages);
  return {
    ageFill, ageAverage:average(usableAges),
    areaMin:Math.min(...areas),areaMax:Math.max(...areas),areaMean,areaSD:stddev(areas,areaMean),
    ageMin:Math.min(...ages),ageMax:Math.max(...ages),ageMean,ageSD:stddev(ages,ageMean),
    zones:[...new Set(normalized.map(r=>r.zone))].sort(),fitRowCount:normalized.length,
  };
}
export function runPipeline(rows: readonly Example[], config: Configuration): PipelineResult {
  const training=rows.filter(r=>r.split==="train");
  const validation=rows.filter(r=>r.split==="validation");
  if(training.length<3 || validation.length<1) throw new Error("The demonstration needs at least 3 training records and 1 validation record.");
  const stats=summarize(config.leak ? [...training,...validation] : training,config);
  const scale=(value:number,which:"area"|"age") => {
    if(config.scaling==="none") return value;
    const lo=which==="area" ? stats.areaMin : stats.ageMin;
    const hi=which==="area" ? stats.areaMax : stats.ageMax;
    const mean=which==="area" ? stats.areaMean : stats.ageMean;
    const sd=which==="area" ? stats.areaSD : stats.ageSD;
    return config.scaling==="minmax" ? (value-lo)/(hi-lo||1) : (value-mean)/sd;
  };
  const prepare=(row:Example):PreparedExample|null => {
    if(config.missing==="drop" && row.age===null) return null;
    const filledAge=row.age ?? stats.ageFill;
    if(filledAge===null) return null;
    const vector=[scale(row.area,"area"),scale(filledAge,"age")];
    if(config.encode) for(const zone of stats.zones) vector.push(Number(row.zone===zone));
    return {...row,filledAge,vector};
  };
  const train=training.map(prepare).filter((r):r is PreparedExample=>r!==null);
  const val=validation.map(prepare).filter((r):r is PreparedExample=>r!==null);
  if(train.length<1) throw new Error("There are no usable training samples after preprocessing.");
  const columns=["area","age",...(config.encode ? stats.zones.map(z=>`zone_${z.toLowerCase()}`) : [])];
  const predictions=val.map(example=>{
    const neighbors=train.map(candidate=>({record:candidate,distance:Math.sqrt(candidate.vector.reduce((sum,v,index)=>sum+(v-example.vector[index])**2,0))}))
      .sort((a,b)=>a.distance-b.distance||a.record.id.localeCompare(b.record.id)).slice(0,Math.min(3,train.length));
    const predicted=average(neighbors.map(n=>n.record.price));
    return {id:example.id,actual:example.price,predicted,error:Math.abs(predicted-example.price),neighbors:neighbors.map(n=>n.record.id)};
  });
  const unseenZones=config.encode ? [...new Set(validation.filter(r=>!stats.zones.includes(r.zone)).map(r=>r.zone))] : [];
  return {stats,columns,train,validation:val,skippedTrain:training.length-train.length,skippedValidation:validation.length-val.length,
    unseenZones,predictions,mae:predictions.length ? average(predictions.map(p=>p.error)) : null};
}
