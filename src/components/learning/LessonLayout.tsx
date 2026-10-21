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
    <>
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        <div className="mb-8">
          <Link href="/" className="cursor-pointer text-sm text-blue-400 hover:text-blue-300">← Back to Jav&apos;s Lab</Link>
          <p className="mt-8 text-sm font-medium text-blue-400">{subjectLabels[subject] ?? subject} / {difficulty}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-400">{description}</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <article id="lesson-article" className="lesson-content min-w-0">{children}</article>
          <div className="order-first lg:order-last"><LessonNavigation /></div>
        </div>
      </main>
    </>
  );
}
