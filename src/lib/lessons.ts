
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
    topic: "types-of-machine-learning",
    title: "Types of Machine Learning",
    description: "Compare five learning paradigms through interactive data, masking, clustering, and rewards.",
    difficulty: "Beginner",
    content: () => import("@/content/ml/types-of-machine-learning.mdx"),
  },
  {
    subject: "ml",
    topic: "data-features-and-labels",
    title: "Data, Features, and Labels",
    description: "Explore samples, input features, target labels, and data quality in an editable dataset.",
    difficulty: "Beginner",
    content: () => import("@/content/ml/data-features-and-labels.mdx"),
  },
  {
    subject: "ml",
    topic: "how-models-learn",
    title: "How Machine Learning Models Learn",
    description: "Train a prediction model, adjust its parameters, and see how feedback reduces error.",
    difficulty: "Beginner",
    content: () => import("@/content/ml/how-models-learn.mdx"),
  },
  {
    subject: "ml",
    topic: "training-validation-and-testing",
    title: "Training, Validation, and Testing",
    description: "Split datasets, select model complexity with validation data, and unlock an unseen test set.",
    difficulty: "Beginner",
    content: () => import("@/content/ml/training-validation-and-testing.mdx"),
  },
  {
    subject: "ml",
    topic: "underfitting-and-overfitting",
    title: "Underfitting and Overfitting",
    description: "Explore model complexity, noisy data, and the gap between training and generalization.",
    difficulty: "Beginner",
    content: () => import("@/content/ml/underfitting-and-overfitting.mdx"),
  },
  {
    subject: "ml",
    topic: "data-preprocessing",
    title: "Data Preprocessing",
    description: "Clean missing values, encode categories, scale features, and prevent data leakage.",
    difficulty: "Beginner",
    content: () => import("@/content/ml/data-preprocessing.mdx"),
  },
  {
    subject: "ml",
    topic: "linear-regression",
    title: "Linear Regression",
    description: "Fit a line to observations, explore residuals, and discover ordinary least squares.",
    difficulty: "Beginner",
    content: () => import("@/content/ml/linear-regression.mdx"),
  },
  {
    subject: "ml",
    topic: "loss-functions",
    title: "Loss Functions (MAE, MSE, RMSE)",
    description: "Compare absolute, squared, and root-mean-squared errors in an interactive prediction lab.",
    difficulty: "Beginner",
    content: () => import("@/content/ml/loss-functions.mdx"),
  },
  {
    subject: "ml",
    topic: "multiple-linear-regression",
    title: "Multiple Linear Regression",
    description: "Predict from two features, fit ordinary least squares, and explore correlated inputs.",
    difficulty: "Intermediate",
    content: () => import("@/content/ml/multiple-linear-regression.mdx"),
  },
  {
    subject: "ml",
    topic: "polynomial-regression",
    title: "Polynomial Regression",
    description: "Transform input powers, fit curved models, and compare validation errors.",
    difficulty: "Intermediate",
    content: () => import("@/content/ml/polynomial-regression.mdx"),
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
