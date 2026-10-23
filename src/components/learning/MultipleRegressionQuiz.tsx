"use client";

import SequentialQuiz from "./SequentialQuiz";

const QUESTIONS = [
  {
    prompt: "An apartment model is ŷ = 25 + 2 × area − 0.5 × age. What is its prediction, in thousands of AZN, for an 80 m² apartment in a 10-year-old building?",
    options: ["180", "155", "190", "165"],
    correct: 0,
    explanation: "Substitute both feature values: 25 + 2(80) − 0.5(10) = 25 + 160 − 5 = 180 thousand AZN.",
  },
  {
    prompt: "In a two-feature linear regression, what does the area coefficient represent, holding building age fixed?",
    options: ["The price of a zero-area property", "The prediction change per extra square metre", "The correlation between area and age", "The prediction error on training data"],
    correct: 1,
    explanation: "The coefficient measures the model's predicted change for one additional unit of area when the other input is held constant. It is not necessarily a causal effect.",
  },
  {
    prompt: "Which row should an ordinary least-squares model use when calculating its training coefficients?",
    options: ["All training and holdout rows", "Only the row with the largest price", "Only designated training rows", "Only designated holdout rows"],
    correct: 2,
    explanation: "The holdout partition stays out of fitting. It can be used later to evaluate how the model predicts unseen examples.",
  },
  {
    prompt: "A building-age weight is −0.8 thousand AZN per year. If age increases from 10 to 15 years while area stays fixed, how does the predicted price change?",
    options: ["Increase by 4 thousand AZN", "Decrease by 0.8 thousand AZN", "Increase by 0.8 thousand AZN", "Decrease by 4 thousand AZN"],
    correct: 3,
    explanation: "Age changes by five years, so the change in prediction is −0.8 × 5 = −4 thousand AZN.",
  },
  {
    prompt: "You fit area and age together, then remove age and refit. Why might the estimated area coefficient change?",
    options: ["The model no longer fits the same set of inputs", "The target values must have changed", "Area automatically becomes a categorical feature", "Multiple regression cannot use area alone"],
    correct: 0,
    explanation: "When you omit a predictor, OLS optimizes a different model. If the predictors are related, the remaining coefficient can absorb part of the omitted feature's association.",
  },
  {
    prompt: "What makes it difficult to identify separate coefficients when two input columns are exactly linearly dependent?",
    options: ["The dataset has more than one input feature", "Different coefficient combinations make the same predictions", "The target has a numerical rather than categorical value", "Each sample has its own target value"],
    correct: 1,
    explanation: "With perfectly dependent feature columns, the design matrix lacks full column rank. Ordinary least squares cannot uniquely identify all coefficients without additional constraints.",
  },
  {
    prompt: "What does an unusually small training RMSE but large holdout RMSE most directly suggest?",
    options: ["The model proves a causal relationship", "The input columns have identical units", "The model may not generalize well", "The model contains no intercept"],
    correct: 2,
    explanation: "Strong fit on training examples does not guarantee good predictions on unseen rows. Holdout error gives a separate check of generalization.",
  },
  {
    prompt: "In the model ŷ = θ₀ + θ₁x₁ + θ₂x₂, what is the purpose of the leading 1 in a design-matrix row [1, x₁, x₂]?",
    options: ["To keep both features in the same units", "To convert the target to a classification label", "To guarantee perfect test performance", "To multiply the intercept coefficient θ₀"],
    correct: 3,
    explanation: "The intercept is the coefficient of a constant feature equal to 1, so the row's dot product includes θ₀ × 1.",
  },
] as const;

export default function MultipleRegressionQuiz(){
  return <SequentialQuiz title="Multiple Linear Regression" questions={QUESTIONS}/>;
}
