
export type GradientStep = {
  iteration: number;
  x: number;
  loss: number;
  gradient: number;
};

export function runGradientDescent(
  initialX: number,
  learningRate: number,
  iterations: number
): GradientStep[] {
  const steps: GradientStep[] = [];
  let x = initialX;

  for (let i = 0; i <= iterations; i++) {
    const loss = x * x;
    const gradient = 2 * x;

    steps.push({
      iteration: i,
      x,
      loss,
      gradient,
    });

    if (i < iterations) {
      x = x - learningRate * gradient;
    }
  }

  return steps;
}
