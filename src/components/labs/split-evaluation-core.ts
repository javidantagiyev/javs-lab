/**
 * Lesson 05 numerical experiment: small, entirely synthetic regression dataset.
 * There are no server calls and no external ML dependencies.
 * The test partition is never passed into the optimizer or hyperparameter selector.
 */
export type Sample = { id: number; x: number; y: number };
export type SplitName = "train" | "validation" | "test";
export type SplitPreset = "60/20/20" | "70/15/15" | "40/30/30";
export type Partition = { train: Sample[]; validation: Sample[]; test: Sample[] };
export type FittedModel = { degree: number; coefficients: number[] };
export type Candidate = { degree: number; model: FittedModel; trainRmse: number; validationRmse: number };

export const DEGREES = [1, 2, 3, 5, 8] as const;
export const PRESETS: readonly SplitPreset[] = ["60/20/20", "70/15/15", "40/30/30"];
export const SIZE = 60;

function hash(n: number) {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

export function generateSamples(noise: number = 6): Sample[] {
  return Array.from({ length: SIZE }, (_, i) => {
    const x = ((i + 0.5) * 10) / SIZE;
    const z = (x - 5) / 5;
    const signal = 49 + 14 * z + 20 * z * z - 12 * z * z * z;
    const jitter = (hash(i * 37 + 113) + hash(i * 79 + 991) - 1) * noise * 1.9;
    return { id: i + 1, x, y: signal + jitter };
  });
}

export function splitSamples(samples: readonly Sample[], preset: SplitPreset, seed: number): Partition {
  const indices = samples.map((_, i) => i);
  // Fisher-Yates shuffle using reproducible arithmetic (same input => same split).
  let s = (seed + 1) >>> 0;
  const random = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const [trainPercent, validPercent] = preset.split("/").map(Number);
  const trainEnd = Math.round(samples.length * trainPercent / 100);
  const validEnd = trainEnd + Math.round(samples.length * validPercent / 100);
  return {
    train: indices.slice(0, trainEnd).map(i => samples[i]),
    validation: indices.slice(trainEnd, validEnd).map(i => samples[i]),
    test: indices.slice(validEnd).map(i => samples[i]),
  };
}

/** Numerically stable Legendre features on [-1,1]; high-degree models use tiny ridge stabilization. */
function features(x: number, degree: number): number[] {
  const z = (x - 5) / 5;
  const values = [1];
  if (degree > 0) values.push(z);
  for (let k = 2; k <= degree; k++) {
    values.push(((2 * k - 1) * z * values[k - 1] - (k - 1) * values[k - 2]) / k);
  }
  return values;
}

function solveLinear(system: number[][], rhs: number[]): number[] {
  const n = rhs.length;
  const a = system.map((row, i) => [...row, rhs[i]]);
  for (let p = 0; p < n; p++) {
    let pivot = p;
    for (let r = p + 1; r < n; r++) if (Math.abs(a[r][p]) > Math.abs(a[pivot][p])) pivot = r;
    [a[p], a[pivot]] = [a[pivot], a[p]];
    const div = a[p][p];
    if (Math.abs(div) < 1e-12) throw new Error("Could not fit this model to the selected examples.");
    for (let j = p; j <= n; j++) a[p][j] /= div;
    for (let r = 0; r < n; r++) if (r !== p) {
      const factor = a[r][p];
      for (let j = p; j <= n; j++) a[r][j] -= factor * a[p][j];
    }
  }
  return a.map(row => row[n]);
}

export function fitModel(samples: readonly Sample[], degree: number): FittedModel {
  if (samples.length < degree + 1) throw new Error("There are too few training examples.");
  const n = degree + 1;
  const lhs = Array.from({ length: n }, () => Array(n).fill(0) as number[]);
  const rhs = Array(n).fill(0) as number[];
  for (const point of samples) {
    const basis = features(point.x, degree);
    for (let i = 0; i < n; i++) {
      rhs[i] += basis[i] * point.y;
      for (let j = 0; j < n; j++) lhs[i][j] += basis[i] * basis[j];
    }
  }
  // Regularization is fixed across candidate degrees, and selected with no access to test data.
  for (let i = 0; i < n; i++) lhs[i][i] += i === 0 ? 1e-8 : 1e-5;
  return { degree, coefficients: solveLinear(lhs, rhs) };
}
export function predict(model: FittedModel, x: number) {
  return features(x, model.degree).reduce((acc, value, i) => acc + value * model.coefficients[i], 0);
}
export function rmse(model: FittedModel, samples: readonly Sample[]): number {
  if (!samples.length) return NaN;
  return Math.sqrt(samples.reduce((sum, row) => sum + (predict(model, row.x) - row.y) ** 2, 0) / samples.length);
}
export function evaluateCandidates(parts: Partition, leakValidation: boolean): Candidate[] {
  const training = leakValidation ? [...parts.train, ...parts.validation] : parts.train;
  return DEGREES.map(degree => {
    const model = fitModel(training, degree);
    return { degree, model, trainRmse: rmse(model, parts.train), validationRmse: rmse(model, parts.validation) };
  });
}
export function bestValidationCandidate(candidates: readonly Candidate[]): Candidate {
  if (!candidates.length) throw new Error("Train models first.");
  return candidates.reduce((best, entry) => entry.validationRmse < best.validationRmse ? entry : best);
}
