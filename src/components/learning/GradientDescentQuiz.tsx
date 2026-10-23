"use client";
import SequentialQuiz from "./SequentialQuiz";

type Question = {
  prompt: string;
  options: [string, string, string];
  correct: number;
  explanation: string;
};

const QUESTIONS: Question[] = [
  {
    prompt: "For f(x) = x², starting at x = 3 with learning rate α = 0.20, what is x after one update?",
    options: ["1.8", "2.8", "0.6"],
    correct: 0,
    explanation: "The derivative is 2x = 6. One step gives 3 − 0.20 × 6 = 1.8.",
  },
  {
    prompt: "At the current point, f′(x) is negative. Which direction does gradient descent move when α > 0?",
    options: ["Left, toward smaller x", "Right, toward larger x", "It cannot move"],
    correct: 1,
    explanation: "The update subtracts a negative number, so the new x is larger than the old x.",
  },
  {
    prompt: "For f(x) = x² with starting x ≠ 0 and a fixed learning rate α = 1, what happens?",
    options: ["It goes straight to zero", "It oscillates between x and −x", "It always increases without bound"],
    correct: 1,
    explanation: "x(next) = (1 − 2α)x = −x when α = 1. The two positions alternate without convergence.",
  },
  {
    prompt: "If the gradient equals zero at a point, which statement is always correct?",
    options: ["The point is a global minimum", "The point is stationary", "The cost must equal zero"],
    correct: 1,
    explanation: "A zero gradient defines a stationary point. It can be a minimum, maximum, or another flat point.",
  },
  {
    prompt: "Which gradient descent variant calculates each update using the complete training dataset?",
    options: ["Stochastic GD", "Mini-batch GD", "Batch GD"],
    correct: 2,
    explanation: "Batch gradient descent uses all training examples for every update; SGD uses one and mini-batch GD uses a small group.",
  },
  {
    prompt: "Why can standardizing numerical input features help gradient descent for linear regression?",
    options: ["It can make the cost landscape less elongated", "It guarantees zero test error", "It removes the need for a learning rate"],
    correct: 0,
    explanation: "Very different feature scales can create a narrow, elongated cost valley. Comparable scales can improve conditioning and convergence speed.",
  },
  {
    prompt: "In the playground f(x) = x², what does the plotted horizontal x represent?",
    options: ["A fixed observed feature value from a training table", "The one variable being optimized", "The number of training examples"],
    correct: 1,
    explanation: "The toy lab minimizes a function of one variable. In regression training, the optimized quantities are model parameters such as w and b.",
  },
];

export default function GradientDescentQuiz() {
  return <SequentialQuiz
    title="Gradient Descent"
    questions={QUESTIONS.map(question => ({
      prompt: question.prompt,
      options: question.options,
      correct: question.correct,
      explanation: question.explanation,
    }))}
  />;
}
