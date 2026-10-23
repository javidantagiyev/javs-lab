/** Pure mathematics for Jav's Lab 008. No ML libraries, networks or random data. */
export type Observation = { id: number; x: number; y: number };
export type Parameters = { intercept: number; slope: number };
export type Metrics = { mse: number; rmse: number; sse: number; r2: number | null; count: number };
export type LeastSquaresResult = { params: Parameters; degenerate: boolean; metrics: Metrics };

export const PRESETS = {
  clear: [ [0.8,25], [2,35], [3.1,45], [4.3,52], [5.4,64], [6.6,71], [8.1,86], [9.2,95] ],
  noisy: [ [0.8,29], [1.7,49], [2.8,38], [3.7,60], [4.9,52], [6.2,83], [7.6,72], [8.8,96] ],
  falling: [ [0.8,91], [1.8,81], [3,73], [4.2,64], [5.3,51], [6.5,46], [7.8,31], [9.1,25] ],
  outlier: [ [0.8,25], [2,35], [3.1,45], [4.3,52], [5.4,64], [6.6,71], [8.1,86], [9.2,25] ],
} as const;
export type PresetKey = keyof typeof PRESETS;
export function observationsFor(preset: PresetKey): Observation[] {
  return PRESETS[preset].map(([x,y], id) => ({x,y,id}));
}
export const INITIAL_PARAMETERS: Parameters = { intercept: 45, slope: 2 };
export const clamp = (value:number, lo:number, hi:number) => Math.max(lo,Math.min(hi,value));
export const predict = ({intercept,slope}:Parameters,x:number) => intercept+slope*x;
export function score(points: readonly Observation[], params:Parameters): Metrics {
  if (!points.length) throw new Error("At least one observation is needed");
  const mean = points.reduce((s,p)=>s+p.y,0)/points.length;
  const sse = points.reduce((s,p)=>s+(p.y-predict(params,p.x))**2,0);
  const sst = points.reduce((s,p)=>s+(p.y-mean)**2,0);
  const mse=sse/points.length;
  return { count:points.length, mse,rmse:Math.sqrt(mse),sse,r2:sst<1e-12?(sse<1e-12?1:null):1-sse/sst };
}
export function leastSquares(points: readonly Observation[]): LeastSquaresResult {
  if (!points.length) throw new Error("At least one observation is needed");
  const xMean=points.reduce((s,p)=>s+p.x,0)/points.length;
  const yMean=points.reduce((s,p)=>s+p.y,0)/points.length;
  const denominator=points.reduce((s,p)=>s+(p.x-xMean)**2,0);
  const degenerate=denominator<1e-12;
  const slope=degenerate?0:points.reduce((s,p)=>s+(p.x-xMean)*(p.y-yMean),0)/denominator;
  const params={intercept:yMean-slope*xMean,slope};
  return {params,degenerate,metrics:score(points,params)};
}
