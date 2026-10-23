"use client";

import { useEffect, useId, useRef, useState } from "react";
import "./sequential-quiz.css";

/** Reusable lesson quiz: ONE question, ONE answer, feedback, then NEXT.
 * Reuse in all future Jav's Lab lessons. Keep the original question data in each lesson's quiz file.
 */
export type SequentialQuestion = {
  prompt: string;
  options: readonly string[];
  correct: number;
  explanation: string;
};

type Props = {
  title: string;
  questions: readonly SequentialQuestion[];
};

export default function SequentialQuiz({ title, questions }: Props) {
  const quizId = useId();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [hasAdvanced, setHasAdvanced] = useState(false);

  const done = step >= questions.length;
  const question = done ? undefined : questions[step];
  const selected = question ? (answers[step] ?? null) : null;
  const score = questions.reduce((total, item, i) => total + Number(answers[i] === item.correct), 0);
  const progress = questions.length === 0 ? 100 : (Math.min(step, questions.length) / questions.length) * 100;

  useEffect(() => {
    if (hasAdvanced) headingRef.current?.focus();
  }, [step, hasAdvanced]);

  function answer(choice: number) {
    if (!question || selected !== null) return;
    setAnswers(previous => previous.map((value, i) => i === step ? choice : value));
  }

  function advance() {
    if (selected === null || done) return;
    setHasAdvanced(true);
    setStep(current => current + 1);
  }

  function restart() {
    setAnswers(questions.map(() => null));
    setStep(0);
    setHasAdvanced(true);
  }

  return (
    <section className="javs-sequential-quiz" aria-label={`${title}: interactive quiz`}>
      <header className="jsq-topline">
        <span>JAV'S LAB / KNOWLEDGE CHECK</span>
        <span>{done ? "COMPLETED" : `QUESTION ${String(step + 1).padStart(2, "0")} / ${String(questions.length).padStart(2, "0")}`}</span>
      </header>
      <div className="jsq-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={Math.min(step, questions.length)}>
        <span style={{ width: `${progress}%` }} />
      </div>
      {question ? (
        <div className="jsq-question" key={step}>
          <p className="jsq-category">{title} <span aria-hidden="true">/</span> {questions.length} questions</p>
          <h3 id={`${quizId}-prompt`} ref={headingRef} tabIndex={-1}>{question.prompt}</h3>
          <div className="jsq-choices" role="group" aria-labelledby={`${quizId}-prompt`}>
            {question.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              const isCorrect = optionIndex === question.correct;
              return (
                <button
                  key={`${step}-${optionIndex}`}
                  type="button"
                  disabled={selected !== null}
                  aria-pressed={isSelected}
                  className={selected === null ? "jsq-choice" : isCorrect ? "jsq-choice is-correct" : isSelected ? "jsq-choice is-incorrect" : "jsq-choice is-muted"}
                  onClick={() => answer(optionIndex)}
                >
                  <span className="jsq-letter" aria-hidden="true">{String.fromCharCode(65 + optionIndex)}</span>
                  <span>{option}</span>
                  {selected !== null && isCorrect && <span className="jsq-indicator" aria-label="Correct choice">✓</span>}
                  {selected !== null && isSelected && !isCorrect && <span className="jsq-indicator" aria-label="Your incorrect choice">×</span>}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className={`jsq-feedback ${selected === question.correct ? "is-right" : "is-wrong"}`} role="status">
              <strong>{selected === question.correct ? "Correct answer." : "Not quite."}</strong>
              <p>{question.explanation}</p>
            </div>
          )}
          <div className="jsq-actions">
            <span>{selected === null ? "Choose an answer to continue." : "Read the explanation, then continue."}</span>
            <button type="button" className="jsq-next" onClick={advance} disabled={selected === null}>
              {step === questions.length - 1 ? "See results →" : "Next question →"}
            </button>
          </div>
        </div>
      ) : (
        <div className="jsq-complete" role="status">
          <p className="jsq-category">QUIZ COMPLETE</p>
          <h3 ref={headingRef} tabIndex={-1}>Your results<span>.</span></h3>
          <div className="jsq-score"><strong>{score}</strong><span>/ {questions.length}</span></div>
          <p>{score === questions.length ? "Excellent. You answered every question correctly." : "Review the explanations and lab, then give it another try."}</p>
          <button type="button" className="jsq-next" onClick={restart}>↻ Try again</button>
        </div>
      )}
    </section>
  );
}
