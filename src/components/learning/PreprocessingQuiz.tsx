"use client";

import { useState } from "react";
import "./preprocessing-quiz.css";

type Question = { prompt: string; choices: [string,string,string]; correct: number; why: string };
const QUESTIONS: Question[] = [
  {prompt:"A training row is missing its age. Which step estimates the missing value from observed training ages?",choices:["One-hot encoding","Imputation","Model evaluation"],correct:1,why:"Imputation replaces missing values using an appropriate strategy, such as the training-set median. Keep missingness in mind: the estimate is not a measured age."},
  {prompt:"A neighborhood is represented as Center = 0, Suburb = 1, Coast = 2. What might a model incorrectly assume?",choices:["The categories have a meaningful numeric order and spacing","There are three categories","The feature is categorical"],correct:0,why:"Integer codes may imply an artificial order or distance. One-hot encoding represents each known category using a separate indicator."},
  {prompt:"Where should a standard scaler learn its mean and standard deviation?",choices:["Training rows only","Training and validation rows together","Only from validation rows"],correct:0,why:"Fit preprocessing on training rows. Then use those frozen parameters to transform held-out observations, avoiding leakage."},
  {prompt:"After training, a new neighborhood appears that was not observed during fit. With handle_unknown='ignore', what happens?",choices:["The model learns a new coefficient automatically","Known neighborhood indicator columns are all zero for that record","The house is automatically removed"],correct:1,why:"An unknown category can be represented using all zeros across the learned one-hot columns. This preserves the fitted feature schema, though it may reduce predictive quality."},
  {prompt:"You switch the lab from standard scaling to no scaling and 3-NN predictions change. Why?",choices:["Feature units influence Euclidean distances","The target prices were secretly retrained","The validation labels changed"],correct:0,why:"A feature with numerically larger values can dominate distance calculations when features are not scaled. The nearest-neighbor model is sensitive to that geometry."},
];
export default function PreprocessingQuiz() {
  const [answers,setAnswers]=useState<(number|null)[]>(()=>QUESTIONS.map(()=>null));
  const [submitted,setSubmitted]=useState(false);
  const ready=answers.every(answer=>answer!==null);
  const score=answers.reduce<number>((sum,answer,i)=>sum+Number(answer===QUESTIONS[i].correct),0);
  return <section className="jml7q" aria-label="Data preprocessing knowledge check">
    <div className="jml7q-header"><span>LESSON 007 / KNOWLEDGE CHECK</span><span>{submitted?`${score} / ${QUESTIONS.length} CORRECT`:`${answers.filter(a=>a!==null).length} / ${QUESTIONS.length} ANSWERED`}</span></div>
    {QUESTIONS.map((question,index)=><fieldset className="jml7q-question" key={question.prompt}>
      <legend><span>{String(index+1).padStart(2,"0")}</span>{question.prompt}</legend>
      <div className="jml7q-choices">{question.choices.map((choice,choiceIndex)=><label key={choice} className={`${answers[index]===choiceIndex?"chosen":""} ${submitted&&choiceIndex===question.correct?"correct":""} ${submitted&&answers[index]===choiceIndex&&choiceIndex!==question.correct?"wrong":""}`}>
        <input type="radio" name={`jml7q-${index}`} checked={answers[index]===choiceIndex} disabled={submitted} onChange={()=>setAnswers(old=>old.map((a,i)=>i===index?choiceIndex:a))}/>{choice}
      </label>)}</div>
      {submitted&&<p className="jml7q-reason"><strong>{answers[index]===question.correct?"Correct.":"Review."}</strong> {question.why}</p>}
    </fieldset>)}
    <div className="jml7q-actions"><button type="button" onClick={()=>{setAnswers(QUESTIONS.map(()=>null));setSubmitted(false);}}>Try again ↻</button><button type="button" disabled={!ready||submitted} onClick={()=>setSubmitted(true)}>{submitted?"Completed":"Check answers →"}</button></div>
    {submitted&&<p className="jml7q-score" role="status">{score} of {QUESTIONS.length} correct. {score===QUESTIONS.length?"You've mastered the main preprocessing decisions.":"Use the explanations and try again when you're ready."}</p>}
  </section>;
}
