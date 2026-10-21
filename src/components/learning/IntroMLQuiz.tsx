"use client";

import { useState } from "react";
import "../labs/intro-ml-lab.css";

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
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const finished = index >= QUESTIONS.length;
  const score = QUESTIONS.reduce((sum, q, i) => sum + Number(answers[i] === q.correct), 0);
  const question = finished ? null : QUESTIONS[index];
  const choice = answers[index];

  return <section className="intro-ml-quiz" aria-label="Introduction to machine learning knowledge check">
    <div className="intro-ml-quiz-head">
      <span>SELF-CHECK / 04 QUESTIONS</span>
      <span>{finished ? "COMPLETE" : `${String(index + 1).padStart(2, "0")} / 04`}</span>
    </div>
    {question ? <>
      <h3>{question.prompt}</h3>
      <div className="intro-ml-quiz-answers">
        {question.options.map((option, optionIndex) => {
          const chosen = choice === optionIndex;
          const correct = question.correct === optionIndex;
          return <button key={option} type="button" disabled={choice !== undefined}
            className={choice !== undefined && correct ? "is-correct" : chosen ? "is-wrong" : ""}
            onClick={() => setAnswers(previous => ({ ...previous, [index]: optionIndex }))}>
            <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
          </button>;
        })}
      </div>
      {choice !== undefined && <div className="intro-ml-quiz-feedback" role="status">
        <strong>{choice === question.correct ? "Correct." : "Not quite."}</strong> {question.explanation}
      </div>}
      <button type="button" className="intro-ml-quiz-next" disabled={choice === undefined}
        onClick={() => setIndex(old => old + 1)}>{index === QUESTIONS.length - 1 ? "See your score →" : "Next question →"}</button>
    </> : <div className="intro-ml-quiz-complete">
      <strong>{score} / {QUESTIONS.length}</strong>
      <p>{score === QUESTIONS.length ? "Excellent — you have the foundations." : "Good practice. Review the lesson and try again to strengthen your understanding."}</p>
      <button type="button" onClick={() => { setIndex(0); setAnswers({}); }}>↻ Try again</button>
    </div>}
  </section>;
}
