"use client";
import { useState } from "react";
import "./generalization-quiz.css";

type Question = { prompt: string; choices: readonly [string,string,string]; answer: number; explanation: string };
const QUESTIONS: readonly Question[] = [
  {prompt:"A straight-line model misses a clearly curved relationship, even on its training examples. What is the likely problem?",choices:["Underfitting", "Overfitting", "Data leakage"],answer:0,explanation:"The model is too restricted to capture the underlying pattern. This is a classic underfitting symptom."},
  {prompt:"A degree-11 model has very low training error but substantially higher validation error. What does this suggest?",choices:["It must be the best model", "It may be fitting noise rather than generalizing", "The validation set trained the model"],answer:1,explanation:"A large train–validation gap is evidence of overfitting, especially when a simpler candidate has a smaller validation error."},
  {prompt:"What typically helps a flexible model overfit less, all else equal?",choices:["Use fewer representative training examples", "Increase model complexity indefinitely", "Gather more representative training examples"],answer:2,explanation:"More representative data can constrain spurious fits. The improvement is not guaranteed, especially when data quality is poor."},
  {prompt:"Which result should guide polynomial-degree selection in this lab?",choices:["The smallest training RMSE", "The smallest validation RMSE", "The smallest final test RMSE across repeated attempts"],answer:1,explanation:"Validation data supports choosing complexity. The test score is reserved for the final, already-selected model."},
  {prompt:"Which statement about the best polynomial degree is correct?",choices:["Degree 11 is always best", "Degree 1 always generalizes best", "It depends on the amount and quality of data and the underlying relationship"],answer:2,explanation:"There is no universal best degree. Data size, noise, regularization and the true relationship all affect model selection."},
];
export default function GeneralizationQuiz() {
  const [answers,setAnswers] = useState<(number|null)[]>(() => QUESTIONS.map(() => null));
  const [submitted,setSubmitted] = useState(false);
  const count = answers.filter(answer => answer !== null).length;
  const score = answers.reduce<number>((total,answer,i) => total + Number(answer === QUESTIONS[i].answer),0);
  return <section className="jml6q" aria-label="Underfitting and overfitting knowledge check">
    <div className="jml6q-header"><span>LESSON 006 / SELF-CHECK</span><span>{submitted ? `${score} / ${QUESTIONS.length} CORRECT` : `${count} / ${QUESTIONS.length} ANSWERED`}</span></div>
    {QUESTIONS.map((question,i) => <fieldset key={question.prompt} className="jml6q-question">
      <legend><span>{String(i+1).padStart(2,"0")}</span> {question.prompt}</legend>
      <div className="jml6q-options">{question.choices.map((choice,j) => <label key={choice} className={`${answers[i]===j ? "selected" : ""} ${submitted && j===question.answer ? "correct" : ""} ${submitted && answers[i]===j && j!==question.answer ? "wrong" : ""}`}>
        <input type="radio" name={`jml6q-${i}`} checked={answers[i]===j} disabled={submitted} onChange={() => setAnswers(previous => previous.map((answer,n) => n === i ? j : answer))}/>{choice}
      </label>)}</div>
      {submitted && <p className="jml6q-explain"><strong>{answers[i]===question.answer ? "Correct." : "Review."}</strong> {question.explanation}</p>}
    </fieldset>)}
    <div className="jml6q-actions"><button type="button" onClick={() => {setSubmitted(false);setAnswers(QUESTIONS.map(() => null));}}>Try again ↻</button><button type="button" disabled={count!==QUESTIONS.length || submitted} onClick={() => setSubmitted(true)}>{submitted ? "Completed ✓" : "Check answers →"}</button></div>
    {submitted && <p className="jml6q-result" role="status">{score}/{QUESTIONS.length} correct. {score===QUESTIONS.length ? "You can now explain the balance between fit and generalization." : "Review the explanations and try the lab with different sample sizes."}</p>}
  </section>;
}
