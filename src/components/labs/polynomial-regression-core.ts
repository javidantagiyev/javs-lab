/** Original synthetic polynomial-regression dataset and small-scale QR least-squares solver.
 * Works entirely in the browser. No validation/test observations enter model fitting.
 */
export type Scenario = "quadratic" | "linear" | "cubic" | "outlier";
export type Sample = { id: number; x: number; y: number };
export type Sets = { train: Sample[]; validation: Sample[]; test: Sample[] };
export type PolyModel = { degree: number; coefficients: number[] };
export type FitResult = { ok: true; model: PolyModel } | { ok: false; reason: string };
export type ErrorMetrics = { count: number; mae: number; mse: number; rmse: number };

const round = (v: number) => Math.round(v * 10000) / 10000;
export const format = (n: number, digits = 3) => Number.isFinite(n) ? n.toFixed(digits) : "—";
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function targetFunction(x: number, scenario: Scenario): number {
  if (scenario === "linear") return 0.2 + 1.1 * x;
  if (scenario === "cubic") return -0.08 - 0.9 * x + 1.7 * x * x * x;
  return 0.65 + 0.75 * x - 1.55 * x * x;
}
function randomGenerator(seed: number) {
  let state = seed >>> 0;
  return () => {state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296;};
}
/** Holdouts are constructed at separate x locations; IDs never overlap. */
export function makeDataset(scenario: Scenario, trainCount: 12 | 24 | 48, noise: number, seed: number): Sets {
  const random = randomGenerator(23051 + seed * 7919 + (scenario === "cubic" ? 113 : scenario === "linear" ? 59 : 0));
  const make = (count: number, prefix: number, offset: number): Sample[] => Array.from({length:count}, (_,i) => {
    const x = clamp(-0.96 + (1.92 * (i + offset)) / count, -0.99, 0.99);
    // Symmetric, bounded perturbation. Training, validation and test use disjoint draws.
    const eps = noise * (random() + random() + random() - 1.5) * 0.9;
    return { id:prefix+i+1, x:round(x), y:round(targetFunction(x,scenario) + eps) };
  });
  const train = make(trainCount, 0, 0.5);
  if (scenario === "outlier") train[Math.floor(train.length * 0.72)].y = round(train[Math.floor(train.length * 0.72)].y + 1.55);
  return {
    train,
    validation:make(18, 1000, 0.31),
    test:make(18, 2000, 0.76),
  };
}

export function predict(model: PolyModel, x: number): number {
  // Horner evaluation uses the same normalized feature x in [-1, 1] shown in the lab.
  let result=0;
  for(let k=model.coefficients.length-1; k>=0; k--) result=result*x+model.coefficients[k];
  return result;
}
export function evaluate(samples: readonly Sample[], model: PolyModel): ErrorMetrics {
  const count=samples.length;
  if(!count)return {count:0,mae:NaN,mse:NaN,rmse:NaN};
  let abs=0,squared=0;
  for(const sample of samples){const error=sample.y-predict(model,sample.x);abs+=Math.abs(error);squared+=error*error;}
  const mse=squared/count;
  return {count,mae:abs/count,mse,rmse:Math.sqrt(mse)};
}

/** Least squares with a Householder QR decomposition (no explicit inverse of X'X).
 * Features are 1,x,x²,...,x^degree. x is normalized to [-1,1] in this lesson.
 * Returns an explicit failure for rank loss rather than fabricated coefficients.
 */
export function fitPolynomial(samples: readonly Sample[], degree: number): FitResult {
  if(!Number.isInteger(degree)||degree<0||degree>12) return {ok:false,reason:"Degree must be an integer from 0 to 12."};
  const n=degree+1,m=samples.length;
  if(m<n) return {ok:false,reason:`At least ${n} training samples are required for degree ${degree}.`};
  if(samples.some(s=>!Number.isFinite(s.x)||!Number.isFinite(s.y)))return {ok:false,reason:"Training values must be finite."};
  const a=samples.map(s=>Array.from({length:n},(_,j)=>s.x**j));
  const b=samples.map(s=>s.y);
  for(let k=0;k<n;k++){
    let norm=0;for(let i=k;i<m;i++)norm=Math.hypot(norm,a[i][k]);
    if(norm<1e-12)return {ok:false,reason:"The polynomial design matrix does not have enough independent columns."};
    const alpha=a[k][k]>=0?-norm:norm;
    const v=Array.from({length:m-k},(_,i)=>a[k+i][k]);
    v[0]-=alpha;
    const vnorm=v.reduce((sum,t)=>sum+t*t,0);
    if(vnorm<1e-22)return {ok:false,reason:"The regression system is numerically singular."};
    const beta=2/vnorm;
    for(let j=k;j<n;j++){
      let projection=0;for(let i=k;i<m;i++)projection+=v[i-k]*a[i][j];
      projection*=beta;
      for(let i=k;i<m;i++)a[i][j]-=projection*v[i-k];
    }
    let projection=0;for(let i=k;i<m;i++)projection+=v[i-k]*b[i];
    projection*=beta;
    for(let i=k;i<m;i++)b[i]-=projection*v[i-k];
  }
  const coefficients=new Array<number>(n).fill(0);
  for(let i=n-1;i>=0;i--){
    const diag=a[i][i];
    if(Math.abs(diag)<1e-10)return {ok:false,reason:"The polynomial fit is numerically unstable. Try fewer powers or more distinct training points."};
    let rhs=b[i];for(let j=i+1;j<n;j++)rhs-=a[i][j]*coefficients[j];
    coefficients[i]=rhs/diag;
    if(!Number.isFinite(coefficients[i]))return {ok:false,reason:"Nonfinite coefficient; try a simpler model."};
  }
  return {ok:true,model:{degree,coefficients}};
}
export type Comparison = { degree: number; trainingRMSE: number; validationRMSE: number; model: PolyModel };
export function compareDegrees(train: readonly Sample[], validation: readonly Sample[], degrees: readonly number[] = [1,2,3,4,5,6,7,8,9]): Comparison[] {
  return degrees.flatMap(degree=>{
    const result=fitPolynomial(train,degree);
    if(!result.ok)return [];
    return [{degree,model:result.model,trainingRMSE:evaluate(train,result.model).rmse,validationRMSE:evaluate(validation,result.model).rmse}];
  });
}
