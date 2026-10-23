"use client";
import SequentialQuiz from "./SequentialQuiz";

type Question = { prompt: string; choices: [string,string,string]; correct: number; why: string };
const QUESTIONS: Question[] = [
  {prompt:"A training row is missing its age. Which step estimates the missing value from observed training ages?",choices:["One-hot encoding","Imputation","Model evaluation"],correct:1,why:"Imputation replaces missing values using an appropriate strategy, such as the training-set median. Keep missingness in mind: the estimate is not a measured age."},
  {prompt:"A neighborhood is represented as Center = 0, Suburb = 1, Coast = 2. What might a model incorrectly assume?",choices:["The categories have a meaningful numeric order and spacing","There are three categories","The feature is categorical"],correct:0,why:"Integer codes may imply an artificial order or distance. One-hot encoding represents each known category using a separate indicator."},
  {prompt:"Where should a standard scaler learn its mean and standard deviation?",choices:["Training rows only","Training and validation rows together","Only from validation rows"],correct:0,why:"Fit preprocessing on training rows. Then use those frozen parameters to transform held-out observations, avoiding leakage."},
  {prompt:"After training, a new neighborhood appears that was not observed during fit. With handle_unknown='ignore', what happens?",choices:["The model learns a new coefficient automatically","Known neighborhood indicator columns are all zero for that record","The house is automatically removed"],correct:1,why:"An unknown category can be represented using all zeros across the learned one-hot columns. This preserves the fitted feature schema, though it may reduce predictive quality."},
  {prompt:"You switch the lab from standard scaling to no scaling and 3-NN predictions change. Why?",choices:["Feature units influence Euclidean distances","The target prices were secretly retrained","The validation labels changed"],correct:0,why:"A feature with numerically larger values can dominate distance calculations when features are not scaled. The nearest-neighbor model is sensitive to that geometry."},
];

export default function PreprocessingQuiz() {
  return <SequentialQuiz
    title="Data Preprocessing"
    questions={QUESTIONS.map(question => ({
      prompt: question.prompt,
      options: question.choices,
      correct: question.correct,
      explanation: question.why,
    }))}
  />;
}
