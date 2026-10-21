
import type { ComponentType } from "react";

export type Lesson = {
  subject: string;
  topic: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  content: () => Promise<{
    default: ComponentType;
  }>;
};

export const lessons: Lesson[] = [
  {
    subject: "ml",
    topic: "gradient-descent",
    title: "Gradient Descent",
    description: "Learn optimization through interactive experiments.",
    difficulty: "Beginner",
    content: () => import("@/content/ml/gradient-descent.mdx"),
  },
];

export function getLesson(subject: string, topic: string) {
  return lessons.find(
    (lesson) =>
      lesson.subject === subject && lesson.topic === topic
  );
}
