"use client";

import { useState } from "react";
import "./data-features-quiz.css";

type Question = { question: string; answers: [string,string,string]; correct: number; explanation: string };
const QUESTIONS:Question[]=[
  {question:"A dataset has 50 plant observations and 4 columns. What does a single row represent?",answers:["One feature","One sample or instance","One entire model"],correct:1,explanation:"Each row represents one observation (a sample). Columns hold measurements and possibly a target."},
  {question:"You want to predict whether a plant is thriving. Which field is the target label?",answers:["The 'thriving/struggling' outcome","Weekly water usage","Pot material"],correct:0,explanation:"The label is the answer we hope to predict, so it must not be provided to the classifier as an input feature."},
  {question:"What is the data type of a 'Clay / Plastic / Ceramic' pot-material column?",answers:["Numerical continuous","A probability","Categorical"],correct:2,explanation:"Pot material is a categorical attribute. Many algorithms require a suitable encoding before using it."},
  {question:"A water-measurement cell is empty. What is a defensible first step?",answers:["Silently treat it as zero","Inspect the missing value and choose an explicit handling strategy","Copy the plant's health label into water"],correct:1,explanation:"Missing is not the same as zero. Depending on the problem you might impute, remove the row, or use a compatible model."},
  {question:"A classifier predicts health using water, sunlight, and the recorded true health label. What went wrong?",answers:["It used too few features","It used too many rows","The target leaked into the inputs"],correct:2,explanation:"Using the answer itself as a predictive input is target leakage and makes the model evaluation misleading."},
];
export default function DataFeaturesQuiz(){
  const [answers,setAnswers]=useState<(number|null)[]>(()=>QUESTIONS.map(()=>null));
  const [checked,setChecked]=useState(false);
  const score=answers.reduce<number>((n,a,i)=>n+Number(a===QUESTIONS[i].correct),0);
  return <section className="jml3q" aria-label="Data features and labels self-check">
    <div className="jml3q-head"><span>LAB REPORT / SELF-CHECK</span><span>{checked?`${score}/${QUESTIONS.length} CORRECT`:`${answers.filter(a=>a!==null).length}/${QUESTIONS.length} ANSWERED`}</span></div>
    {QUESTIONS.map((question,i)=><fieldset key={question.question} className="jml3q-question">
      <legend><span>{String(i+1).padStart(2,"0")}</span> {question.question}</legend>
      <div className="jml3q-options">{question.answers.map((option,n)=><label key={option} className={`${answers[i]===n?"jml3q-chosen":""} ${checked&&question.correct===n?"jml3q-correct":""} ${checked&&answers[i]===n&&question.correct!==n?"jml3q-wrong":""}`}>
        <input type="radio" name={`jml3q-${i}`} checked={answers[i]===n} disabled={checked} onChange={()=>setAnswers(old=>old.map((value,j)=>i===j?n:value))}/>{option}
      </label>)}</div>
      {checked&&<p className="jml3q-explanation"><strong>{answers[i]===question.correct?"Correct.":"Review."}</strong> {question.explanation}</p>}
    </fieldset>)}
    <div className="jml3q-actions"><button type="button" onClick={()=>{setChecked(false);setAnswers(QUESTIONS.map(()=>null));}}>Start over ↺</button><button type="button" disabled={checked||answers.some(a=>a===null)} onClick={()=>setChecked(true)}>{checked?"Completed":"Check answers →"}</button></div>
    {checked&&<p className="jml3q-score" role="status">{score}/{QUESTIONS.length} correct. {score===QUESTIONS.length?"Excellent: you can distinguish samples, features, and targets.":"Review the explanations and try again."}</p>}
  </section>;
}
