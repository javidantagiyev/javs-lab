"use client";
import SequentialQuiz from "./SequentialQuiz";
type Question={ prompt:string; options:readonly [string,string,string]; correct:number; explanation:string };
const QUESTIONS:readonly Question[]=[
  {prompt:"For a line ŷ = 20 + 7x, what does the slope represent?",options:["The predicted value at x = 0", "An increase of 7 predicted units for each extra unit of x", "The error of every observation"],correct:1,explanation:"The slope changes the prediction by seven units whenever x increases by one, holding the fitted line fixed."},
  {prompt:"Ordinary least squares chooses a line to minimize what?",options:["The sum of squared vertical residuals", "The number of training observations", "The maximum predicted value"],correct:0,explanation:"It minimizes Σ(yᵢ − ŷᵢ)², so large residuals receive a disproportionately large penalty."},
  {prompt:"What is a residual for one observed training point?",options:["Its input x", "Its predicted value alone", "Observed y minus predicted ŷ"],correct:2,explanation:"A residual measures the vertical discrepancy between an observed target and the fitted line at the same x."},
  {prompt:"What happens when a very unusual point is added to a small dataset?",options:["The least-squares line must stay unchanged", "The least-squares coefficients can change substantially", "The model becomes a classification model"],correct:1,explanation:"Squared errors make ordinary least squares sensitive to influential points. How much it moves depends on the observation."},
  {prompt:"The fitted training R² is 0.92. What can we safely conclude?",options:["The relationship is necessarily causal", "The model will achieve exactly the same score on new data", "The line explains about 92% of the variation in these training targets relative to predicting their mean"],correct:2,explanation:"Training R² describes fit on the evaluated data; it does not establish cause-and-effect or future predictive quality."},
];

export default function LinearRegressionQuiz() {
  return <SequentialQuiz
    title="Linear Regression"
    questions={QUESTIONS.map(question => ({
      prompt: question.prompt,
      options: question.options,
      correct: question.correct,
      explanation: question.explanation,
    }))}
  />;
}
