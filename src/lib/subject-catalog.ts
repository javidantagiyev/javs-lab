export type Subject = {
  slug: string;
  number: string;
  title: string;
  category: string;
  description: string;
  artwork: string;
  lessons: { title: string; description: string; href: string; status: "available" }[];
};

export const subjects: Subject[] = [
  {
    slug: "ai",
    number: "01",
    title: "Artificial Intelligence",
    category: "INTELLIGENT SYSTEMS",
    description: "How machines reason, represent knowledge, and learn patterns.",
    artwork: "/art/ai.svg",
    lessons: [],
  },
  {
    slug: "ml",
    number: "02",
    title: "Machine Learning",
    category: "LEARNING SYSTEMS",
    description: "Optimization, models, training, and the mathematics of learning.",
    artwork: "/art/ml.svg",
    lessons: [
      {
        title: "Introduction to Machine Learning",
        description: "Learn from examples, build a tiny spam detector, and discover generalization.",
        href: "/learn/ml/introduction-to-machine-learning",
        status: "available",
      },
      {
        title: "Types of Machine Learning",
        description: "Explore labels, clustering, self-supervision, and rewards.",
        href: "/learn/ml/types-of-machine-learning",
        status: "available",
      },
      {
        title: "Data, Features, and Labels",
        description: "Inspect an editable dataset, select features, and train a small classifier.",
        href: "/learn/ml/data-features-and-labels",
        status: "available",
      },
      {
        title: "How Machine Learning Models Learn",
        description: "Watch a line learn from training examples and compare unseen predictions.",
        href: "/learn/ml/how-models-learn",
        status: "available",
      },
      {
        title: "Training, Validation, and Testing",
        description: "Compare models on validation data, avoid leakage, and unlock the final holdout.",
        href: "/learn/ml/training-validation-and-testing",
        status: "available",
      },
      {
        title: "Underfitting and Overfitting",
        description: "Experiment with model complexity, noise, and generalization.",
        href: "/learn/ml/underfitting-and-overfitting",
        status: "available",
      },
      {
        title: "Data Preprocessing",
        description: "Prepare model-ready features using safe, repeatable transformations.",
        href: "/learn/ml/data-preprocessing",
        status: "available",
      },
      {
        title: "Linear Regression",
        description: "Explore the line of best fit, residuals, and regression predictions.",
        href: "/learn/ml/linear-regression",
        status: "available",
      },
      {
        title: "Loss Functions (MAE, MSE, RMSE)",
        description: "Compare errors, explore outliers, and discover mean versus median objectives.",
        href: "/learn/ml/loss-functions",
        status: "available",
      },
      {
        title: "Multiple Linear Regression",
        description: "Fit models with multiple features, residuals, and held-out evaluation.",
        href: "/learn/ml/multiple-linear-regression",
        status: "available",
      },
      {
        title: "Polynomial Regression",
        description: "Fit polynomial curves and select complexity using validation data.",
        href: "/learn/ml/polynomial-regression",
        status: "available",
      },
      {
        title: "Gradient Descent",
        description: "See how optimization moves toward lower loss — one step at a time.",
        href: "/learn/ml/gradient-descent",
        status: "available",
      },
    ],
  },
  {
    slug: "calculus",
    number: "03",
    title: "Calculus",
    category: "CHANGE & CONTINUITY",
    description: "Understand limits, derivatives, integrals, and motion.",
    artwork: "/art/calculus.svg",
    lessons: [],
  },
  {
    slug: "linear-algebra",
    number: "04",
    title: "Linear Algebra",
    category: "SPACE & TRANSFORMATIONS",
    description: "Explore vectors, matrices, and transformations of space.",
    artwork: "/art/linear-algebra.svg",
    lessons: [],
  },
];

export function findSubject(slug: string): Subject | undefined {
  return subjects.find((subject) => subject.slug === slug);
}
