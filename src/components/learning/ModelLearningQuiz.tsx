"use client";
import SequentialQuiz from "./SequentialQuiz";
type Question = {prompt: string; options: readonly [string, string, string]; correct: number; why: string};
const QUESTIONS: readonly Question[] = [
  {prompt:"A model predicts a score of 65, but the recorded score is 80. What is its prediction error (prediction minus actual)?",options:["−15 points","15 points","0 points"],correct:0,why:"Prediction error is 65 − 80 = −15. Loss functions often square or take the absolute value of such errors."},
  {prompt:"In the model ŷ = intercept + slope × hours, what changes when you adjust the slope?",options:["How many examples you own","How much the prediction changes per additional hour","Which outcome is the true label"],correct:1,why:"Slope determines the effect of a one-unit increase in the input feature. The intercept sets the prediction when hours = 0."},
  {prompt:"After one gradient-descent update, the training loss decreases. What does that tell us?",options:["The model must now generalize perfectly","The new parameters fit the training examples better under this loss","The dataset labels have changed"],correct:1,why:"The update reduced the selected training objective. It does not guarantee good behavior on new, unseen examples."},
  {prompt:"Why does the lab show unseen examples that are excluded from training?",options:["To check whether a fitted model can predict examples it did not learn from","To increase the number of parameters","To help the model memorize the answers"],correct:0,why:"Performance on data not used to fit the model is a more informative check of generalization than training performance alone."},
  {prompt:"You raise the learning rate too far and the loss starts to rise sharply. What is the best explanation?",options:["The labels automatically became incorrect","The optimization updates may be overshooting the solution","A higher learning rate always means better accuracy"],correct:1,why:"Large steps can overshoot or diverge. A sensible learning rate depends on the problem, model, and parameter scaling."},
];

export default function ModelLearningQuiz() {
  return <SequentialQuiz
    title="How Models Learn"
    questions={QUESTIONS.map(question => ({
      prompt: question.prompt,
      options: question.options,
      correct: question.correct,
      explanation: question.why,
    }))}
  />;
}
