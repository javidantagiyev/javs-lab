"use client";
import SequentialQuiz from "./SequentialQuiz";

const QUESTIONS = [
  {
    prompt: "A spam filter learns from emails labeled spam or normal. What kind of learning is this?",
    options: ["Unsupervised learning", "Supervised learning", "Reinforcement learning"],
    correct: 1,
    explanation: "The training examples include the desired answers (labels), so this is supervised learning.",
  },
  {
    prompt: "A model scores 100% on its training emails but 50% on unseen emails. What is the warning sign?",
    options: ["Overfitting", "A perfect model", "Too few features by definition"],
    correct: 0,
    explanation: "It memorizes training patterns without generalizing well. A high training score alone is not evidence of success.",
  },
  {
    prompt: "Which set should you keep aside for an unbiased final evaluation?",
    options: ["The training set", "The test set", "The same examples used for tuning"],
    correct: 1,
    explanation: "Use the test set for final evaluation. Use training data for fitting and a validation set for model and hyperparameter choices.",
  },
  {
    prompt: "Which option best describes instance-based learning?",
    options: ["Comparing new cases with stored examples", "Always training a neural network", "Manually writing a rule for every case"],
    correct: 0,
    explanation: "Instance-based methods generalize using similarity to previously seen examples, rather than necessarily fitting an explicit predictive equation.",
  },
] as const;

export default function IntroMLQuiz() {
  return <SequentialQuiz
    title="Spam Filter"
    questions={QUESTIONS.map(question => ({
      prompt: question.prompt,
      options: question.options,
      correct: question.correct,
      explanation: question.explanation,
    }))}
  />;
}
