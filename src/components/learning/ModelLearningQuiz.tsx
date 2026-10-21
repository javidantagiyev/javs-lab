"use client";
import { useState } from "react";
import "./model-learning-quiz.css";

type Question = {prompt: string; options: readonly [string, string, string]; correct: number; why: string};
const QUESTIONS: readonly Question[] = [
  {prompt:"A model predicts a score of 65, but the recorded score is 80. What is its prediction error (prediction minus actual)?",options:["−15 points","15 points","0 points"],correct:0,why:"Prediction error is 65 − 80 = −15. Loss functions often square or take the absolute value of such errors."},
  {prompt:"In the model ŷ = intercept + slope × hours, what changes when you adjust the slope?",options:["How many examples you own","How much the prediction changes per additional hour","Which outcome is the true label"],correct:1,why:"Slope determines the effect of a one-unit increase in the input feature. The intercept sets the prediction when hours = 0."},
  {prompt:"After one gradient-descent update, the training loss decreases. What does that tell us?",options:["The model must now generalize perfectly","The new parameters fit the training examples better under this loss","The dataset labels have changed"],correct:1,why:"The update reduced the selected training objective. It does not guarantee good behavior on new, unseen examples."},
  {prompt:"Why does the lab show unseen examples that are excluded from training?",options:["To check whether a fitted model can predict examples it did not learn from","To increase the number of parameters","To help the model memorize the answers"],correct:0,why:"Performance on data not used to fit the model is a more informative check of generalization than training performance alone."},
  {prompt:"You raise the learning rate too far and the loss starts to rise sharply. What is the best explanation?",options:["The labels automatically became incorrect","The optimization updates may be overshooting the solution","A higher learning rate always means better accuracy"],correct:1,why:"Large steps can overshoot or diverge. A sensible learning rate depends on the problem, model, and parameter scaling."},
];

export default function ModelLearningQuiz(){
  const [answers,setAnswers]=useState<(number|null)[]>(()=>QUESTIONS.map(()=>null));
  const [graded,setGraded]=useState(false);
  const score=answers.reduce<number>((value,answer,i)=>value+Number(answer===QUESTIONS[i].correct),0);
  const allAnswered=answers.every(answer=>answer!==null);
  return <section className="jml4q" aria-label="How models learn knowledge check">
    <div className="jml4q-head"><span>LESSON 004 / KNOWLEDGE CHECK</span><span>{graded?`${score} / ${QUESTIONS.length} CORRECT`:`${answers.filter(a=>a!==null).length} / ${QUESTIONS.length} ANSWERED`}</span></div>
    {QUESTIONS.map((q,i)=><fieldset key={q.prompt} className="jml4q-question">
      <legend><span>{String(i+1).padStart(2,"0")}</span> {q.prompt}</legend>
      <div className="jml4q-choices">{q.options.map((option,j)=><label key={option} className={`${answers[i]===j?"jml4q-selected":""} ${graded&&q.correct===j?"jml4q-correct":""} ${graded&&answers[i]===j&&q.correct!==j?"jml4q-incorrect":""}`}>
        <input type="radio" name={`jml4q-${i}`} checked={answers[i]===j} disabled={graded} onChange={()=>setAnswers(old=>old.map((answer,n)=>i===n?j:answer))}/>{option}
      </label>)}</div>
      {graded&&<p className="jml4q-explanation"><strong>{answers[i]===q.correct?"Correct.":"Review."}</strong> {q.why}</p>}
    </fieldset>)}
    <div className="jml4q-actions"><button type="button" onClick={()=>{setAnswers(QUESTIONS.map(()=>null));setGraded(false);}}>Try again ↺</button><button type="button" disabled={!allAnswered||graded} onClick={()=>setGraded(true)}>{graded?"Completed":"Check answers →"}</button></div>
    {graded&&<p className="jml4q-result" role="status">{score}/{QUESTIONS.length} correct. {score===QUESTIONS.length?"Excellent. You're ready to explore how we evaluate models.":"Review the explanations and try another round."}</p>}
  </section>;
}
