/** Jav's Lab ML curriculum. Original grouping, mapped to Géron 3e chapters. */
export type CourseLesson = {
  number: number;
  title: string;
  description: string;
  href?: string;
};
export type CourseModule = {
  number: number;
  title: string;
  subtitle: string;
  chapters: string;
  lessons: CourseLesson[];
};

export const mlCourse: CourseModule[] = [
  {
    number: 1, title: "Machine Learning Foundations", subtitle: "Discover what learning from data really means.", chapters: "GÉRON / CHAPTERS 1–2",
    lessons: [
      { number: 1, title: "Introduction to Machine Learning", description: "Why machines learn from examples; train a spam detector.", href: "/learn/ml/introduction-to-machine-learning" },
      { number: 2, title: "Types of Machine Learning", description: "Discover labels, clusters, self-supervision, and rewards.", href: "/learn/ml/types-of-machine-learning" },
      { number: 3, title: "Data, Features & Labels", description: "Understand the building blocks of a dataset." , href: "/learn/ml/data-features-and-labels" },
      { number: 4, title: "How Models Learn", description: "From data to a useful predictive model.", href: "/learn/ml/how-models-learn"  },
      { number: 5, title: "Training, Validation & Testing", description: "Evaluate models without fooling yourself.", href: "/learn/ml/training-validation-and-testing"  },
      { number: 6, title: "Underfitting & Overfitting", description: "Find the balance between memorizing and generalizing.", href: "/learn/ml/underfitting-and-overfitting"  },
      { number: 7, title: "Data Preprocessing", description: "Prepare reliable features for learning.", href: "/learn/ml/data-preprocessing"  },
    ],
  },
  {
    number: 2, title: "Regression & Optimization", subtitle: "Predict numbers and learn how to fit models.", chapters: "GÉRON / CHAPTER 4",
    lessons: [
      { number: 8, title: "Linear Regression", description: "Fit a line through noisy observations.", href: "/learn/ml/linear-regression"  },
      { number: 9, title: "Loss Functions", description: "Compare MAE, MSE and RMSE.", href: "/learn/ml/loss-functions"  },
      { number: 10, title: "Gradient Descent", description: "Navigate the loss surface, one update at a time.", href: "/learn/ml/gradient-descent" },
      { number: 11, title: "Multiple Linear Regression", description: "Predict using several input features.", href: "/learn/ml/multiple-linear-regression"  },
      { number: 12, title: "Polynomial Regression", description: "See how flexibility shapes a fitted curve.", href: "/learn/ml/polynomial-regression"  },
      { number: 13, title: "Ridge, Lasso & Elastic Net", description: "Control model complexity with regularization." },
    ],
  },
  {
    number: 3, title: "Classification", subtitle: "Teach models to choose between categories.", chapters: "GÉRON / CHAPTERS 3–5 + KNN",
    lessons: [
      { number: 14, title: "Classification Fundamentals", description: "Decisions, classes, and boundaries." },
      { number: 15, title: "Logistic Regression", description: "From scores to probabilities and decisions." },
      { number: 16, title: "The Confusion Matrix", description: "Explore all four prediction outcomes." },
      { number: 17, title: "Precision, Recall, F1 & ROC", description: "Compare different definitions of success." },
      { number: 18, title: "K-Nearest Neighbors", description: "Learn using the most similar examples." },
      { number: 19, title: "Support Vector Machines", description: "Discover separating margins and kernels." },
    ],
  },
  {
    number: 4, title: "Trees & Ensemble Learning", subtitle: "Combine simpler decisions into powerful models.", chapters: "GÉRON / CHAPTERS 6–7, 2",
    lessons: [
      { number: 20, title: "Decision Trees", description: "Split data into understandable decisions." },
      { number: 21, title: "Random Forests", description: "What changes when many trees vote?" },
      { number: 22, title: "Boosting", description: "Learn from mistakes in successive rounds." },
      { number: 23, title: "Model Selection & Tuning", description: "Choose models with systematic validation." },
    ],
  },
  {
    number: 5, title: "Unsupervised Learning", subtitle: "Look for structure without known answers.", chapters: "GÉRON / CHAPTERS 8–9",
    lessons: [
      { number: 24, title: "Clustering: K-Means & DBSCAN", description: "Find natural groupings in unlabeled data." },
      { number: 25, title: "Dimensionality Reduction & PCA", description: "Preserve structure in fewer dimensions." },
      { number: 26, title: "Anomaly Detection", description: "Spot unusual patterns and outliers." },
    ],
  },
];

export const mlLessonCount = mlCourse.reduce((total, module) => total + module.lessons.length, 0);
export const mlAvailableCount = mlCourse.reduce((total, module) => total + module.lessons.filter((lesson) => Boolean(lesson.href)).length, 0);
