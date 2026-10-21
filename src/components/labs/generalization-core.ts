/** Deterministic educational regression experiment. No external dependencies. */
export type Observation = { id: string; x: number; y: number };
export type Dataset = { train: Observation[]; validation: Observation[]; test: Observation[] };
export type Polynomial = { degree: number; weights: number[] };
export type Evaluation = { degree: number; model: Polynomial; trainRmse: number; validationRmse: number };
export const DEGREES = [1, 2, 3, 5, 8, 11] as const;
export const TRAIN_SIZES = [12, 24, 48, 96] as const;

function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function gaussian(next: () => number) {
  const u = Math.max(1e-12, next());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next());
}
export function underlying(x: number): number {
  const z = (x - 5) / 5;
  return 50 + 21 * Math.sin(2.3 * z + 0.3) + 9 * z;
}
function sampleSet(count: number, noise: number, seed: number, tag: string): Observation[] {
  const next = random(seed);
  // Evenly cover the input range; jitter prevents an artificially perfect grid.
  const samples = Array.from({ length: count }, (_, i) => {
    const x = Math.max(0, Math.min(10, 10 * (i + 0.14 + next() * 0.72) / count));
    return { id: `${tag}-${i}`, x, y: underlying(x) + gaussian(next) * noise };
  });
  // Shuffle only the display order; all observations remain independent.
  for (let i = samples.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [samples[i], samples[j]] = [samples[j], samples[i]];
  }
  return samples;
}
export function makeDataset(size: number, noise: number, seed: number): Dataset {
  if (!Number.isInteger(size) || size < 12 || size > 100) throw new Error("Invalid training size");
  if (!Number.isFinite(noise) || noise < 0 || noise > 20) throw new Error("Invalid noise");
  return {
    train: sampleSet(size, noise, seed * 23 + 11, "train"),
    validation: sampleSet(64, noise, seed * 23 + 271, "validation"),
    test: sampleSet(64, noise, seed * 23 + 997, "test"),
  };
}
/** Chebyshev basis is better conditioned than raw x^degree. */
function basis(x: number, degree: number): number[] {
  const z = (x - 5) / 5;
  const terms = [1];
  if (degree >= 1) terms.push(z);
  for (let j = 2; j <= degree; j++) terms.push(2 * z * terms[j - 1] - terms[j - 2]);
  return terms;
}
function solve(a: number[][], b: number[]): number[] {
  const n = b.length;
  const aug = a.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let best = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[best][col])) best = row;
    }
    [aug[col], aug[best]] = [aug[best], aug[col]];
    const divisor = aug[col][col];
    if (Math.abs(divisor) < 1e-14) throw new Error("Could not solve the model; try regenerating data.");
    for (let j = col; j <= n; j++) aug[col][j] /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }
  return aug.map(row => row[n]);
}
export function fitPolynomial(train: Observation[], degree: number): Polynomial {
  if (train.length < degree + 1) throw new Error("Too few training examples for this degree");
  const n = degree + 1;
  const a: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const b = Array(n).fill(0) as number[];
  for (const point of train) {
    const phi = basis(point.x, degree);
    for (let i = 0; i < n; i++) {
      b[i] += phi[i] * point.y;
      for (let j = 0; j < n; j++) a[i][j] += phi[i] * phi[j];
    }
  }
  // Very small numerical stabilizer. The same value is used for all models.
  // Never penalize the intercept; this is a fixed teaching implementation, not a tuned hyperparameter.
  for (let i = 1; i < n; i++) a[i][i] += 1e-7 * train.length;
  return { degree, weights: solve(a, b) };
}
export function predict(model: Polynomial, x: number): number {
  const phi = basis(x, model.degree);
  return phi.reduce((sum, value, index) => sum + value * model.weights[index], 0);
}
export function rmse(model: Polynomial, observations: Observation[]): number {
  if (observations.length === 0) return NaN;
  return Math.sqrt(observations.reduce((sum, point) => {
    const error = predict(model, point.x) - point.y;
    return sum + error * error;
  }, 0) / observations.length);
}
export function trainCandidates(data: Dataset): Evaluation[] {
  return DEGREES.map(degree => {
    const model = fitPolynomial(data.train, degree);
    return { degree, model, trainRmse: rmse(model, data.train), validationRmse: rmse(model, data.validation) };
  });
}
export function bestByValidation(rows: Evaluation[]): Evaluation | null {
  return rows.reduce<Evaluation | null>((best, row) => !best || row.validationRmse < best.validationRmse ? row : best, null);
}
