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
