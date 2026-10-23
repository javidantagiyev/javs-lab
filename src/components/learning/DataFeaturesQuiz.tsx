"use client";
import SequentialQuiz from "./SequentialQuiz";

type Question = { question: string; answers: [string,string,string]; correct: number; explanation: string };
const QUESTIONS:Question[]=[
  {question:"A dataset has 50 plant observations and 4 columns. What does a single row represent?",answers:["One feature","One sample or instance","One entire model"],correct:1,explanation:"Each row represents one observation (a sample). Columns hold measurements and possibly a target."},
  {question:"You want to predict whether a plant is thriving. Which field is the target label?",answers:["The 'thriving/struggling' outcome","Weekly water usage","Pot material"],correct:0,explanation:"The label is the answer we hope to predict, so it must not be provided to the classifier as an input feature."},
  {question:"What is the data type of a 'Clay / Plastic / Ceramic' pot-material column?",answers:["Numerical continuous","A probability","Categorical"],correct:2,explanation:"Pot material is a categorical attribute. Many algorithms require a suitable encoding before using it."},
  {question:"A water-measurement cell is empty. What is a defensible first step?",answers:["Silently treat it as zero","Inspect the missing value and choose an explicit handling strategy","Copy the plant's health label into water"],correct:1,explanation:"Missing is not the same as zero. Depending on the problem you might impute, remove the row, or use a compatible model."},
  {question:"A classifier predicts health using water, sunlight, and the recorded true health label. What went wrong?",answers:["It used too few features","It used too many rows","The target leaked into the inputs"],correct:2,explanation:"Using the answer itself as a predictive input is target leakage and makes the model evaluation misleading."},
];

export default function DataFeaturesQuiz() {
  return <SequentialQuiz
    title="Dataset Studio"
    questions={QUESTIONS.map(question => ({
      prompt: question.question,
      options: question.answers,
      correct: question.correct,
      explanation: question.explanation,
    }))}
  />;
}
