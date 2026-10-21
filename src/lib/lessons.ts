
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
    topic: "introduction-to-machine-learning",
    title: "Introduction to Machine Learning",
    description: "Understand how machines learn from data, train a spam filter, and test generalization.",
    difficulty: "Beginner",
    content: () => import("@/content/ml/introduction-to-machine-learning.mdx"),
  },
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
