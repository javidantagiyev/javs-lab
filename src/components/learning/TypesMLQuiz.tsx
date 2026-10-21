"use client";
import { useState } from "react";
import "./types-ml-quiz.css";

type Question={question:string;answers:[string,string,string];correct:number;why:string};
const QUESTIONS:Question[]=[
  {question:"You have 1,000 photos, each already labeled as 'cat' or 'dog'. What is the main learning paradigm?",answers:["Supervised learning","Unsupervised learning","Reinforcement learning"],correct:0,why:"The expected category is provided for each example, so the model trains using known labels."},
  {question:"You have customer data but no customer segments. Your algorithm looks for similar groups. What is it doing?",answers:["Classification from known labels","Unsupervised clustering","Learning from rewards"],correct:1,why:"Clustering searches for structure in unlabeled examples. No correct group assignment is supplied."},
  {question:"A model hides pixels from photographs and learns to reconstruct them using the original pixels as targets. What is this?",answers:["Self-supervised learning","Manual labeling","Reinforcement learning"],correct:0,why:"The training targets come automatically from the observed data, instead of being annotated by people."},
  {question:"An agent chooses moves in a game and learns from scores after its actions. What kind of feedback is this?",answers:["Class labels","A similarity measure only","Rewards and penalties"],correct:2,why:"Reinforcement learning learns a policy from the consequences of actions, not from a correct action label for every step."},
  {question:"A model receives labeled examples and can update itself as new examples arrive. Which description is accurate?",answers:["Supervised and online learning","Unsupervised and batch learning","Reinforcement and instance-based learning"],correct:0,why:"These are different classification axes: supervision describes the training feedback; online describes incremental updates."},
];
export default function TypesMLQuiz(){
  const [answers,setAnswers]=useState<(number|null)[]>(Array(QUESTIONS.length).fill(null));
  const [show,setShow]=useState(false);
  const score=answers.reduce<number>((v,answer,i)=>v+Number(answer===QUESTIONS[i].correct),0);
  return <section className="jml-quiz" aria-label="Types of machine learning knowledge check">
    <div className="jml-quiz-top"><span>LAB REPORT / SELF-CHECK</span><span>{show?`${score}/${QUESTIONS.length} CORRECT`:`${answers.filter(v=>v!==null).length}/${QUESTIONS.length} ANSWERED`}</span></div>
    {QUESTIONS.map((q,i)=><fieldset className="jml-quiz-question" key={q.question}>
      <legend><span>{String(i+1).padStart(2,"0")}</span> {q.question}</legend>
      <div className="jml-quiz-options">{q.answers.map((answer,n)=><label key={answer} className={`${answers[i]===n?"chosen":""} ${show&&n===q.correct?"correct":""} ${show&&answers[i]===n&&n!==q.correct?"wrong":""}`}>
        <input type="radio" name={`jml-q-${i}`} checked={answers[i]===n} disabled={show} onChange={()=>setAnswers(old=>old.map((v,index)=>index===i?n:v))}/>{answer}
      </label>)}</div>
      {show&&<p className="jml-quiz-feedback"><strong>{answers[i]===q.correct?"Correct.":"Review."}</strong> {q.why}</p>}
    </fieldset>)}
    <div className="jml-quiz-actions"><button type="button" onClick={()=>{setAnswers(Array(QUESTIONS.length).fill(null));setShow(false);}} className="jml-quiz-reset">Start over ↺</button>
      <button type="button" className="jml-quiz-submit" onClick={()=>setShow(true)} disabled={show||answers.some(answer=>answer===null)}>{show?"Check complete":"Check my answers →"}</button></div>
    {show&&<p className="jml-quiz-score" role="status">Score: {score}/{QUESTIONS.length}. {score===QUESTIONS.length?"Excellent—every paradigm identified correctly.":"Review the explanations, then try again."}</p>}
  </section>;
}
