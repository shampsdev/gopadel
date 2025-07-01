import type { Rank } from "../../types/rank.type";

export const ranks: Rank[] = [
  {
    title: "Beginner",
    from: 0,
    to: 1.7,
  },
  {
    title: "Upper Beginner",
    from: 1.7,
    to: 2.7,
  },
  {
    title: "Intermediate",
    from: 2.7,
    to: 3.5,
  },
  {
    title: "Upper Intermediate",
    from: 3.5,
    to: 4.5,
  },
  {
    title: "Advanced",
    from: 4.5,
    to: 6.0,
  },
  {
    title: "Pro",
    from: 6.0,
    to: 7.0,
  },
] as const;
