/** Small, deterministic, independent learning functions for Jav's Lab Lesson 03.
 * All samples are invented for teaching and do not describe real agricultural data.
 */
export type Feature = "water" | "sun";
export type Pot = "Clay" | "Plastic" | "Ceramic";
export type PlantSample = {
  id: number;
  water: number | null; // liters per week
  sun: number | null;   // hours per day
  pot: Pot;             // categorical feature, displayed but not encoded
  healthy: boolean;    // target label; NEVER used in distance calculations
};
export type TrainedDataset = { samples: PlantSample[]; features: Feature[] };

export const START_PLANTS: PlantSample[] = [
  {id:1,water:0.8,sun:2.2,pot:"Clay",healthy:false},
  {id:2,water:1.2,sun:4.1,pot:"Plastic",healthy:false},
  {id:3,water:1.0,sun:8.4,pot:"Ceramic",healthy:false},
  {id:4,water:2.4,sun:5.1,pot:"Plastic",healthy:true},
  {id:5,water:2.8,sun:7.2,pot:"Clay",healthy:true},
  {id:6,water:3.2,sun:6.2,pot:"Ceramic",healthy:true},
  {id:7,water:3.5,sun:8.8,pot:"Plastic",healthy:true},
  {id:8,water:4.7,sun:9.2,pot:"Clay",healthy:false},
  {id:9,water:4.4,sun:2.9,pot:"Plastic",healthy:false},
  {id:10,water:2.1,sun:7.8,pot:"Ceramic",healthy:true},
  {id:11,water:3.1,sun:2.1,pot:"Clay",healthy:false},
  {id:12,water:null,sun:6.8,pot:"Ceramic",healthy:true},
];

const scales: Record<Feature, number> = { water: 5, sun: 10 };
export function eligibleSamples(rows: PlantSample[], features: Feature[]): PlantSample[] {
  if (!features.length) return [];
  return rows.filter(row => features.every(feature => row[feature] !== null && Number.isFinite(row[feature])));
}
export function fitDataset(rows: PlantSample[], features: Feature[]): TrainedDataset | null {
  if (!features.length) return null;
  const clean = eligibleSamples(rows,features);
  if (clean.length < 3) return null;
  return {samples: clean.map(row=>({...row})),features:[...features]};
}
export type Neighbor = {id:number;healthy:boolean;distance:number};
export type Prediction = { healthy:boolean; votes:number; neighbors:Neighbor[] };
export function predictDataset(model:TrainedDataset, query:{water:number;sun:number}, k=3):Prediction | null {
  if (!model.features.length || model.samples.length < k) return null;
  const neighbors=model.samples.map(sample=>{
    const sum=model.features.reduce((acc,feature)=>{
      const target=sample[feature];
      if(target===null) return NaN;
      const d=(Number(target)-query[feature])/scales[feature];
      return acc+d*d;
    },0);
    return {id:sample.id,healthy:sample.healthy,distance:Math.sqrt(sum)};
  }).filter(row=>Number.isFinite(row.distance))
    .sort((a,b)=>a.distance-b.distance || a.id-b.id).slice(0,k);
  if(neighbors.length!==k) return null;
  const votes=neighbors.filter(n=>n.healthy).length;
  return {healthy:votes>k/2,votes,neighbors};
}
export function boundedNumber(text:string,min:number,max:number):number|null {
  if(text.trim()==="") return null;
  const value=Number(text);
  if(!Number.isFinite(value)) return null;
  return Math.max(min,Math.min(max,value));
}
