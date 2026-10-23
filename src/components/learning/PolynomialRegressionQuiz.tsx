"use client";

import SequentialQuiz from "./SequentialQuiz";

const QUESTIONS = [
  {
    prompt: "A regression model predicts ŷ = 1 + 2x². What does it predict when x = −3?",
    options: ["−17", "7", "19", "10"],
    correct: 2,
    explanation: "Square x first: (−3)² = 9. Then 1 + 2 × 9 = 19. Polynomial features can use even powers of negative inputs.",
  },
  {
    prompt: "You transform a single feature x into [x, x², x³], then fit ordinary linear regression with an intercept. What kind of model is this?",
    options: ["Degree-2 polynomial regression", "Degree-3 polynomial regression", "Three-target regression", "Three separate unrelated models"],
    correct: 1,
    explanation: "A linear regression with powers up through x³ implements a third-degree polynomial in the original input. There is still one target and one fitted model.",
  },
  {
    prompt: "Why is polynomial regression still called linear regression even though its predictions can curve?",
    options: ["Its coefficient values must all be positive", "Its loss is always proportional to x", "It is linear in its fitted coefficients", "Its predictions must be straight between adjacent points"],
    correct: 2,
    explanation: "For fixed inputs, ŷ = θ₀ + θ₁x + θ₂x² is a linear combination of the unknown coefficients θ. The input transformation can be nonlinear.",
  },
  {
    prompt: "A degree-4 polynomial in one input, including an intercept, has how many coefficients?",
    options: ["4", "3", "6", "5"],
    correct: 3,
    explanation: "The terms are 1, x, x², x³, and x⁴: five coefficients in total, θ₀ through θ₄.",
  },
  {
    prompt: "For a single input value x = 2, which row belongs in the degree-2 design matrix when an intercept is fitted?",
    options: ["[1, 2, 4]", "[2, 4, 8]", "[1, 2, 2]", "[2, 2, 4]"],
    correct: 0,
    explanation: "The bias column is 1, the first feature is x = 2, and the second feature is x² = 4. This gives [1, 2, 4].",
  },
  {
    prompt: "A degree-9 polynomial fits 12 training points extremely well but has much higher validation RMSE than a degree-2 model. What is the most defensible interpretation?",
    options: ["The degree-9 model has necessarily learned the real function", "The degree-2 model cannot predict unseen data", "The degree-9 model may be overfitting the training noise", "Validation points must be included in the degree-9 fit"],
    correct: 2,
    explanation: "A large training-versus-validation error gap is evidence of weak generalization for that particular fit. A complex curve may follow sample noise rather than the underlying pattern.",
  },
  {
    prompt: "You have models of degrees 1 through 9 and a separate training, validation, and test split. Which procedure protects the final test estimate?",
    options: ["Use test RMSE to choose the degree, then report that test RMSE", "Fit on training, select degree with validation, and evaluate the chosen model once on test", "Fit on all three splits and evaluate training RMSE", "Pick the degree with lowest training RMSE and skip evaluation"],
    correct: 1,
    explanation: "Training examples determine coefficients; validation guides model selection; a previously untouched test set evaluates the finalized choice. Repeatedly selecting based on test scores leaks test information into the process.",
  },
  {
    prompt: "A polynomial is fitted only for x values between −1 and 1. What is the key concern when predicting at x = 8?",
    options: ["The polynomial formula stops being defined", "The coefficients automatically become zero", "The number of polynomial features decreases", "High-degree terms can produce unreliable extrapolation far outside training"],
    correct: 3,
    explanation: "Polynomial equations can still be evaluated outside the training range, but powers such as x⁸ can grow very rapidly. Without relevant data there, the extrapolated prediction may be unreliable.",
  },
] as const;

export default function PolynomialRegressionQuiz(){
  return <SequentialQuiz title="Polynomial Regression" questions={QUESTIONS}/>;
}
