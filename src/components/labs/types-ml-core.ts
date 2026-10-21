/** Pure, deterministic teaching algorithms used by the five browser-only experiments. */
export type Label = 0 | 1;
export type Sample = { id: number; x: number; y: number; label: Label };
export type Vec = { x: number; y: number };
export type KNNResult = { label: Label; votes: [number, number]; neighbors: Sample[] };
export const START_SAMPLES: Sample[] = [
  {id:1,x:.13,y:.22,label:0},{id:2,x:.24,y:.33,label:0},{id:3,x:.34,y:.15,label:0},
  {id:4,x:.17,y:.46,label:0},{id:5,x:.41,y:.33,label:0},{id:6,x:.33,y:.56,label:0},
  {id:7,x:.46,y:.17,label:0},{id:8,x:.27,y:.12,label:0},
  {id:9,x:.72,y:.66,label:1},{id:10,x:.83,y:.75,label:1},{id:11,x:.68,y:.89,label:1},
  {id:12,x:.9,y:.58,label:1},{id:13,x:.61,y:.7,label:1},{id:14,x:.79,y:.49,label:1},
  {id:15,x:.56,y:.84,label:1},{id:16,x:.86,y:.9,label:1},
];
export const distanceSq = (a: Vec,b: Vec) => (a.x-b.x)**2+(a.y-b.y)**2;
export function knn(samples: Sample[], query: Vec, k: number): KNNResult | null {
  if (!samples.length) return null;
  const neighbors = samples.slice().sort((a,b)=>distanceSq(a,query)-distanceSq(b,query)).slice(0,Math.max(1,k));
  const votes: [number,number] = [0,0];
  neighbors.forEach(point=>votes[point.label]++);
  const label: Label = votes[1]>votes[0] ? 1 : votes[0]>votes[1] ? 0 : neighbors[0].label;
  return {label,votes,neighbors};
}
export function assignClusters(samples: Sample[], centers: Vec[]): number[] {
  return samples.map(point=>distanceSq(point,centers[0])<=distanceSq(point,centers[1])?0:1);
}
export function clusterStep(samples: Sample[], centers: Vec[]): Vec[] {
  const assignment = assignClusters(samples,centers);
  return centers.map((center,index)=>{
    const group = samples.filter((_,i)=>assignment[i]===index);
    if (!group.length) return center;
    return {x:group.reduce((v,p)=>v+p.x,0)/group.length,y:group.reduce((v,p)=>v+p.y,0)/group.length};
  });
}
export const SIGNAL = [2,4,3,7,8,7,11,12,10,14];
/** Fit a single interpolation weight by minimizing mean squared error on automatically masked values. */
export function fitMaskedWeight(signal: number[], holdout: number) {
  let numerator = 0, denominator = 0, count = 0;
  for(let i=1;i<signal.length-1;i++) {
    if(i===holdout) continue;
    const delta=signal[i-1]-signal[i+1];
    numerator+=(signal[i]-signal[i+1])*delta;
    denominator+=delta*delta;
    count++;
  }
  const weight=denominator===0?.5:Math.max(0,Math.min(1,numerator/denominator));
  return {weight,count};
}
export function predictMasked(signal:number[],index:number,weight:number) {
  return weight*signal[index-1]+(1-weight)*signal[index+1];
}
export type QTable = number[][];
export const blankQ = ():QTable=>Array.from({length:16},()=>[0,0,0,0]);
export const ACTIONS = ["↑","→","↓","←"] as const;
export function move(state:number,action:number):number {
  const x=state%4,y=Math.floor(state/4);
  const nx=Math.max(0,Math.min(3,x+(action===1?1:action===3?-1:0)));
  const ny=Math.max(0,Math.min(3,y+(action===2?1:action===0?-1:0)));
  return ny*4+nx;
}
export function greedyAction(values:number[]) {return values.indexOf(Math.max(...values));}
export function trainQ(base:QTable,existingEpisodes:number,count:number):QTable {
  const q=base.map(row=>row.slice());
  let seed=(existingEpisodes*8191+29)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let e=0;e<count;e++){
    let state=0;
    const eps=Math.max(.10,.48*Math.pow(.997,existingEpisodes+e));
    for(let step=0;step<45;step++){
      const action=random()<eps?Math.floor(random()*4):greedyAction(q[state]);
      const next=move(state,action);
      const done=next===5||next===15;
      const reward=next===15?1:next===5?-1:-.04;
      const target=reward+(done?0:.93*Math.max(...q[next]));
      q[state][action]+=.22*(target-q[state][action]);
      state=next;
      if(done)break;
    }
  }
  return q;
}
export function policyPath(q:QTable,maxSteps=14):number[] {
  const path=[0];let state=0;
  for(let i=0;i<maxSteps;i++){
    const next=move(state,greedyAction(q[state]));
    if(next===state||path.includes(next))break;
    path.push(next);state=next;
    if(state===15||state===5)break;
  }
  return path;
}
