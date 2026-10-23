"use client";
import SequentialQuiz from "./SequentialQuiz";
type Question={question:string;answers:[string,string,string];correct:number;why:string};
const QUESTIONS:Question[]=[
  {question:"You have 1,000 photos, each already labeled as 'cat' or 'dog'. What is the main learning paradigm?",answers:["Supervised learning","Unsupervised learning","Reinforcement learning"],correct:0,why:"The expected category is provided for each example, so the model trains using known labels."},
  {question:"You have customer data but no customer segments. Your algorithm looks for similar groups. What is it doing?",answers:["Classification from known labels","Unsupervised clustering","Learning from rewards"],correct:1,why:"Clustering searches for structure in unlabeled examples. No correct group assignment is supplied."},
  {question:"A model hides pixels from photographs and learns to reconstruct them using the original pixels as targets. What is this?",answers:["Self-supervised learning","Manual labeling","Reinforcement learning"],correct:0,why:"The training targets come automatically from the observed data, instead of being annotated by people."},
  {question:"An agent chooses moves in a game and learns from scores after its actions. What kind of feedback is this?",answers:["Class labels","A similarity measure only","Rewards and penalties"],correct:2,why:"Reinforcement learning learns a policy from the consequences of actions, not from a correct action label for every step."},
  {question:"A model receives labeled examples and can update itself as new examples arrive. Which description is accurate?",answers:["Supervised and online learning","Unsupervised and batch learning","Reinforcement and instance-based learning"],correct:0,why:"These are different classification axes: supervision describes the training feedback; online describes incremental updates."},
];

export default function TypesMLQuiz() {
  return <SequentialQuiz
    title="Five Types of Machine Learning"
    questions={QUESTIONS.map(question => ({
      prompt: question.question,
      options: question.answers,
      correct: question.correct,
      explanation: question.why,
    }))}
  />;
}
