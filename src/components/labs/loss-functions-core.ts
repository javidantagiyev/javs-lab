/** Small, pure numerical helpers for the Lesson 09 experiment. */
export type Sample = { id: number; truth: number; prediction: number };
export type Scenario = "baseline" | "outlier" | "bias" | "skewed" | "perfect";
export type Objective = "mae" | "mse" | "rmse";

export const PRESETS: Record<Scenario, { label: string; samples: Sample[]; description: string }> = {
  baseline: {
    label: "Everyday mistakes",
    description: "Several small errors; no single observation dominates the loss.",
    samples: [
      {id:1,truth:33,prediction:36},{id:2,truth:44,prediction:41},
      {id:3,truth:52,prediction:54},{id:4,truth:61,prediction:56},
      {id:5,truth:73,prediction:75},{id:6,truth:81,prediction:79},
    ],
  },
  outlier: {
    label: "One huge mistake",
    description: "Five fairly good predictions plus one unusually large error.",
    samples: [
      {id:1,truth:35,prediction:36},{id:2,truth:44,prediction:43},
      {id:3,truth:52,prediction:51},{id:4,truth:63,prediction:62},
      {id:5,truth:74,prediction:73},{id:6,truth:92,prediction:32},
    ],
  },
  bias: {
    label: "Every prediction is +8",
    description: "A systematic error across the whole dataset.",
    samples: [
      {id:1,truth:27,prediction:35},{id:2,truth:36,prediction:44},
      {id:3,truth:45,prediction:53},{id:4,truth:56,prediction:64},
      {id:5,truth:67,prediction:75},{id:6,truth:79,prediction:87},
    ],
  },
  skewed: {
    label: "Skewed target values",
    description: "Five ordinary target values and one unusually high one; compare mean and median.",
    samples: [
      {id:1,truth:24,prediction:25},{id:2,truth:26,prediction:28},
      {id:3,truth:28,prediction:27},{id:4,truth:29,prediction:31},
      {id:5,truth:31,prediction:30},{id:6,truth:99,prediction:96},
    ],
  },
  perfect: {
    label: "Perfect predictions",
    description: "All predictions exactly match their targets.",
    samples: [
      {id:1,truth:28,prediction:28},{id:2,truth:39,prediction:39},
      {id:3,truth:48,prediction:48},{id:4,truth:61,prediction:61},
      {id:5,truth:75,prediction:75},{id:6,truth:88,prediction:88},
    ],
  },
};
export function samplesFor(preset: Scenario): Sample[] { return PRESETS[preset].samples.map(row => ({...row})); }
export function clamp(value: number, min: number, max: number) { return Math.max(min,Math.min(max,value)); }
export function round(value: number, digits=2) { return Number(value.toFixed(digits)); }
export function evaluate(samples: Sample[]) {
  if (!samples.length) return { mae:NaN,mse:NaN,rmse:NaN,totalAbs:0,totalSquared:0, maxAbs:NaN, items:[] as Array<Sample & {residual:number;absolute:number;squared:number}> };
  let totalAbs=0,totalSquared=0,maxAbs=0;
  const items=samples.map(s=>{
    const residual=s.truth-s.prediction;
    const absolute=Math.abs(residual),squared=residual*residual;
    totalAbs+=absolute;totalSquared+=squared;maxAbs=Math.max(maxAbs,absolute);
    return {...s,residual,absolute,squared};
  });
  const mae=totalAbs/samples.length,mse=totalSquared/samples.length;
  return {mae,mse,rmse:Math.sqrt(mse),totalAbs,totalSquared,maxAbs,items};
}
export function constantSummary(values: number[]) {
  if (!values.length) return {mean:NaN,median:NaN};
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  const sorted=[...values].sort((a,b)=>a-b);
  const center=Math.floor(sorted.length/2);
  const median=sorted.length%2?sorted[center]:(sorted[center-1]+sorted[center])/2;
  return {mean,median};
}
export function constantErrors(values: number[], prediction: number) {
  return evaluate(values.map((truth,id)=>({id,truth,prediction})));
}
