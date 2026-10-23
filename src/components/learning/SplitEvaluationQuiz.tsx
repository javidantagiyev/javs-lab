"use client";
import SequentialQuiz from "./SequentialQuiz";
type Question = { prompt: string; choices: [string, string, string]; correct: number; why: string };
const QUESTIONS: readonly Question[] = [
  { prompt: "You have 100 labeled examples and use a 60/20/20 split. How many belong to the validation set?", choices: ["60", "20", "40"], correct: 1, why: "A 60/20/20 split assigns 60% to training, 20% to validation, and 20% to testing. With 100 records, validation contains 20." },
  { prompt: "You fit a model's coefficients to the training set. Which set should guide your choice of polynomial degree?", choices: ["Validation set", "Test set", "Training set only"], correct: 0, why: "The validation set compares candidate designs without allowing test data to influence the choice. The training set fits coefficients." },
  { prompt: "A degree-8 model has the lowest training error, but degree 3 has lower validation error. Which degree is preferable under this selection rule?", choices: ["Degree 8, because training error always wins", "Degree 3, because validation evaluates held-out examples", "Neither: always choose the simplest degree"], correct: 1, why: "Validation error is the relevant selection criterion here. A very flexible model can achieve low training error without generalizing as well." },
  { prompt: "You standardize every feature using statistics calculated from the entire dataset before splitting. What's the potential issue?", choices: ["The features have changed units", "Information from held-out data can leak into the training process", "It guarantees the model will underfit"], correct: 1, why: "Preprocessing parameters should generally be fitted on the training portion and then applied to validation and test data to avoid information leakage." },
  { prompt: "After checking the test score, you try five more degrees and select the one with the best test result. What happened?", choices: ["You used the test set for model selection, compromising its independence", "You improved the reliability of your first test estimate", "You performed ordinary training without changing the evaluation"], correct: 0, why: "Repeatedly using test scores to choose a model turns the test set into another validation set. Keep a genuinely untouched holdout for final evaluation." },
];

export default function SplitEvaluationQuiz() {
  return <SequentialQuiz
    title="Training, Validation, and Testing"
    questions={QUESTIONS.map(question => ({
      prompt: question.prompt,
      options: question.choices,
      correct: question.correct,
      explanation: question.why,
    }))}
  />;
}
