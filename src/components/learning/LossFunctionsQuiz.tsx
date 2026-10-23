"use client";
import SequentialQuiz from "./SequentialQuiz";
const QUESTIONS=[
  { prompt:"A model predicts 18, but the actual target is 24. What is the absolute error?",options:["−6", "6", "36"],correct:1,explanation:"Residual = 24 − 18 = +6, so the absolute error is |6| = 6." },
  { prompt:"Which metric expresses prediction error in squared target units?",options:["MAE", "RMSE", "MSE"],correct:2,explanation:"MSE averages squared residuals, so its units are target units squared. MAE and RMSE return to the original units." },
  { prompt:"One residual changes from 4 to 8. How does its squared-error contribution change?",options:["It doubles, from 4 to 8", "It quadruples, from 16 to 64", "It stays the same"],correct:1,explanation:"Squaring magnifies large mistakes: 4² = 16 while 8² = 64, four times larger." },
  { prompt:"Model A has lower MSE than model B on the exact same evaluation set. Which has lower RMSE?",options:["Model A", "Model B", "It cannot be determined"],correct:0,explanation:"RMSE is √MSE. Square root is strictly increasing for nonnegative numbers, so their ranking is identical." },
  { prompt:"Which constant prediction minimizes the MAE for a fixed set of target values?",options:["Always the mean", "A median of the target values", "Always the largest target"],correct:1,explanation:"A median minimizes the sum of absolute deviations. The mean minimizes the sum of squared deviations." },
];

export default function LossFunctionsQuiz() {
  return <SequentialQuiz
    title="Loss Functions"
    questions={QUESTIONS.map(question => ({
      prompt: question.prompt,
      options: question.options,
      correct: question.correct,
      explanation: question.explanation,
    }))}
  />;
}
