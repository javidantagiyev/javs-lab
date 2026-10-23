"use client";
import SequentialQuiz from "./SequentialQuiz";
type Question = { prompt: string; choices: readonly [string,string,string]; answer: number; explanation: string };
const QUESTIONS: readonly Question[] = [
  {prompt:"A straight-line model misses a clearly curved relationship, even on its training examples. What is the likely problem?",choices:["Underfitting", "Overfitting", "Data leakage"],answer:0,explanation:"The model is too restricted to capture the underlying pattern. This is a classic underfitting symptom."},
  {prompt:"A degree-11 model has very low training error but substantially higher validation error. What does this suggest?",choices:["It must be the best model", "It may be fitting noise rather than generalizing", "The validation set trained the model"],answer:1,explanation:"A large train–validation gap is evidence of overfitting, especially when a simpler candidate has a smaller validation error."},
  {prompt:"What typically helps a flexible model overfit less, all else equal?",choices:["Use fewer representative training examples", "Increase model complexity indefinitely", "Gather more representative training examples"],answer:2,explanation:"More representative data can constrain spurious fits. The improvement is not guaranteed, especially when data quality is poor."},
  {prompt:"Which result should guide polynomial-degree selection in this lab?",choices:["The smallest training RMSE", "The smallest validation RMSE", "The smallest final test RMSE across repeated attempts"],answer:1,explanation:"Validation data supports choosing complexity. The test score is reserved for the final, already-selected model."},
  {prompt:"Which statement about the best polynomial degree is correct?",choices:["Degree 11 is always best", "Degree 1 always generalizes best", "It depends on the amount and quality of data and the underlying relationship"],answer:2,explanation:"There is no universal best degree. Data size, noise, regularization and the true relationship all affect model selection."},
];

export default function GeneralizationQuiz() {
  return <SequentialQuiz
    title="Underfitting and Overfitting"
    questions={QUESTIONS.map(question => ({
      prompt: question.prompt,
      options: question.choices,
      correct: question.answer,
      explanation: question.explanation,
    }))}
  />;
}
