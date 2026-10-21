import type { ReactNode } from "react";
import Link from "next/link";
import LessonNavigation from "./LessonNavigation";

type Props = {
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  children: ReactNode;
};

const subjectLabels: Record<string, string> = {
  ml: "Machine Learning",
  ai: "Artificial Intelligence",
  calculus: "Calculus",
  "linear-algebra": "Linear Algebra",
};

export default function LessonLayout({ title, description, subject, difficulty, children }: Props) {
  return (
    <main className="javs-lesson">
      <div className="javs-lesson-hero">
        <div className="javs-lesson-shell">
          <div className="javs-lesson-hero-top">
            <Link href={`/subjects/${subject}`} className="javs-lesson-back">← &nbsp; {subjectLabels[subject] ?? subject}</Link>
            <span className="javs-lesson-edition">JAV&apos;S LAB &nbsp; / &nbsp; INTERACTIVE NOTES</span>
          </div>
          <div className="javs-lesson-hero-main">
            <div>
              <p className="javs-lesson-kicker"><span className="javs-lesson-status-dot" /> {subjectLabels[subject] ?? subject} <span className="javs-lesson-slash">/</span> {difficulty}</p>
              <h1>{title}<span className="javs-lesson-gold">.</span></h1>
              <p className="javs-lesson-lead">{description}</p>
            </div>
            <div className="javs-lesson-hero-mark" aria-hidden="true">
              <div className="javs-lesson-orbit orbit-one" />
              <div className="javs-lesson-orbit orbit-two" />
              <span>∇</span>
            </div>
          </div>
          <div className="javs-lesson-hero-foot"><span>READ THE THEORY</span><span className="javs-lesson-hero-arrow">↓</span><span>RUN THE EXPERIMENT</span></div>
        </div>
      </div>
      <LessonNavigation />
      <div className="javs-lesson-shell javs-lesson-body">
        <article id="lesson-article" className="lesson-content javs-lesson-article">
          {children}
        </article>
        <div className="javs-lesson-bottom">
          <span>END OF LESSON &nbsp; / &nbsp; KEEP EXPERIMENTING</span>
          <Link href={`/subjects/${subject}`}>Back to {subjectLabels[subject] ?? subject} ↗</Link>
        </div>
      </div>
    </main>
  );
}
