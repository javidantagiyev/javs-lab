/**
 * Tiny, deterministic multiple linear regression playground.
 * All observations are fictional apartment listings, with prices in thousands of AZN.
 * Fit uses only the training partition, never the held-out observations.
 */
export type Apartment = {
  id: number;
  area: number; // square metres
  age: number; // years
  price: number; // thousands AZN
};
export type Model = { intercept: number; area: number; age: number };
export type Features = { area: boolean; age: boolean };
export type Scenario = "balanced" | "correlated" | "outlier";
export type Metrics = { count: number; mse: number; rmse: number; mae: number; r2: number | null };
export type FitResult = { model: Model; unique: boolean; featureCount: number; reason?: string };

const AREA = [48,54,62,67,72,77,84,89,96,101,109,115,123,131,139,144,151,158];
const AGE =  [ 8,25, 5,33,13, 2,29,16,35, 7,24, 4,30,18,10,37,23, 5];
const NOISE=[-5, 3, 1,-4, 6,-2, 4,-3, 2,-5, 5,-2, 1, 4,-4, 3,-1, 2];

export function dataFor(scenario: Scenario): { train: Apartment[]; holdout: Apartment[] } {
  const rows = AREA.map((area, i) => {
    const age = scenario === "correlated"
      ? Math.max(1, Math.round(47 - area * 0.25 + [2,-1,1,0,-2,1,-1,2,0,-2,2,-1,0,1,-2,2,-1,1][i]))
      : AGE[i];
    const price = Math.round((24 + 1.87 * area - 0.83 * age + NOISE[i] + (scenario === "outlier" && i === 12 ? 88 : 0)) * 10) / 10;
    return { id: i + 1, area, age, price };
  });
  // Fixed, disclosed split; no sampling or leakage into the fit.
  const holdoutIds = new Set([4, 9, 14, 18]);
  return {train: rows.filter(r => !holdoutIds.has(r.id)), holdout: rows.filter(r => holdoutIds.has(r.id))};
}

export function predict(model: Model, area: number, age: number): number {
  return model.intercept + model.area * area + model.age * age;
}

export function metrics(rows: Apartment[], model: Model): Metrics {
  if (!rows.length) return {count:0,mse:NaN,rmse:NaN,mae:NaN,r2:null};
  const errors = rows.map(r=>r.price-predict(model,r.area,r.age));
  const mse = errors.reduce((s,e)=>s+e*e,0)/rows.length;
  const mae = errors.reduce((s,e)=>s+Math.abs(e),0)/rows.length;
  const mean=rows.reduce((s,r)=>s+r.price,0)/rows.length;
  const total=rows.reduce((s,r)=>s+(r.price-mean)**2,0);
  const squared=mse*rows.length;
  return {count:rows.length,mse,rmse:Math.sqrt(mse),mae,r2:total<1e-12?(squared<1e-12?1:null):1-squared/total};
}

export function correlation(rows: Apartment[]): number | null {
  if(rows.length<2)return null;
  const n=rows.length;
  const ma=rows.reduce((s,p)=>s+p.area,0)/n;
  const mb=rows.reduce((s,p)=>s+p.age,0)/n;
  const numerator=rows.reduce((s,p)=>s+(p.area-ma)*(p.age-mb),0);
  const a=rows.reduce((s,p)=>s+(p.area-ma)**2,0);
  const b=rows.reduce((s,p)=>s+(p.age-mb)**2,0);
  return a*b<1e-12?null:numerator/Math.sqrt(a*b);
}

/** Solve a tiny least-squares normal system with partial pivoting.
 * Centering/scaling to sensible units (area/100 and age/30) limits round-off.
 * A non-unique system is *reported*, rather than pretending a unique coefficient exists.
 */
export function fitOLS(train: Apartment[], features: Features): FitResult {
  const selected = ([features.area ? "area" : null, features.age ? "age" : null].filter(Boolean)) as ("area"|"age")[];
  if(!train.length) return {model:{intercept:0,area:0,age:0},unique:false,featureCount:selected.length,reason:"No training samples."};
  const cols = 1 + selected.length;
  const design = train.map(r=>[1,...selected.map(f=> f==="area"?r.area/100:r.age/30)]);
  const aug = Array.from({length:cols},(_,i)=>{
    const lhs=Array.from({length:cols},(_,j)=>design.reduce((s,row)=>s+row[i]*row[j],0));
    return [...lhs,design.reduce((s,row,k)=>s+row[i]*train[k].price,0)];
  });
  for(let col=0;col<cols;col++){
    let pivot=col;
    for(let row=col+1;row<cols;row++)if(Math.abs(aug[row][col])>Math.abs(aug[pivot][col]))pivot=row;
    if(Math.abs(aug[pivot][col])<1e-9){
      return {model:{intercept:0,area:0,age:0},unique:false,featureCount:selected.length,reason:"The selected features do not determine unique OLS coefficients. Try another feature set."};
    }
    [aug[col],aug[pivot]]=[aug[pivot],aug[col]];
    const scale=aug[col][col];
    for(let j=col;j<=cols;j++)aug[col][j]/=scale;
    for(let row=0;row<cols;row++){
      if(row===col)continue;
      const factor=aug[row][col];
      for(let j=col;j<=cols;j++)aug[row][j]-=factor*aug[col][j];
    }
  }
  const theta=aug.map(row=>row[cols]);
  const model:Model={intercept:theta[0],area:0,age:0};
  selected.forEach((f,i)=>{model[f]=theta[i+1]/(f==="area"?100:30);});
  return {model,unique:true,featureCount:selected.length};
}

export const INITIAL_MODEL:Model={intercept:38,area:1.25,age:-0.2};
export const INITIAL_FEATURES:Features={area:true,age:true};
export const format=(n:number,d=2)=>Number.isFinite(n)?n.toFixed(d):"—";
