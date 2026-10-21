/**
 * Jav's Lab Lesson 04: pedagogical, deterministic linear model.
 * All samples are invented; no data is fetched and no external ML service is called.
 * To keep gradient descent numerically legible, optimization uses x/10 and y/100.
 */
export type Observation = { hours: number; score: number };
export type ModelParameters = { intercept: number; slope: number };

export const TRAINING_SAMPLES: readonly Observation[] = [
  { hours: 0, score: 12 }, { hours: 1, score: 20 },
  { hours: 2, score: 29 }, { hours: 3, score: 37 },
  { hours: 4, score: 46 }, { hours: 6, score: 63 },
  { hours: 7, score: 68 }, { hours: 9, score: 87 },
];
export const UNSEEN_SAMPLES: readonly Observation[] = [
  { hours: 5, score: 54 }, { hours: 8, score: 78 }, { hours: 10, score: 96 },
];
export const INITIAL_MODEL: ModelParameters = { intercept: 72, slope: -3 };
export const START_RATE = 0.35;

export function predict(model: ModelParameters, hours: number): number {
  return model.intercept + model.slope * hours;
}
export function mse(model: ModelParameters, examples: readonly Observation[]): number {
  if (!examples.length) return NaN;
  return examples.reduce((sum, row) => sum + (predict(model, row.hours) - row.score) ** 2, 0) / examples.length;
}
export function rmse(model: ModelParameters, examples: readonly Observation[]): number {
  return Math.sqrt(mse(model, examples));
}

/** A single full-batch gradient update minimizing mean squared error.
 * Learning rate is defined for normalized input/target coordinates, not score units.
 * Model shown to the student remains intercept in score points and slope in points/hour.
 */
export function gradientStep(model: ModelParameters, rate: number, examples: readonly Observation[] = TRAINING_SAMPLES): ModelParameters {
  if (!examples.length || !Number.isFinite(rate) || rate <= 0) return model;
  const w0 = model.intercept / 100;
  const w1 = model.slope / 10;
  let g0 = 0, g1 = 0;
  for (const row of examples) {
    const x = row.hours / 10;
    const error = (w0 + w1 * x) - row.score / 100;
    g0 += 2 * error / examples.length;
    g1 += 2 * error * x / examples.length;
  }
  return { intercept: (w0 - rate * g0) * 100, slope: (w1 - rate * g1) * 10 };
}
export function isSafeModel(model: ModelParameters): boolean {
  return Number.isFinite(model.intercept) && Number.isFinite(model.slope) &&
    Math.abs(model.intercept) < 10_000 && Math.abs(model.slope) < 1_000;
}
