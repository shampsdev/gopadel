import type { Rank } from "../../types/rank.type";

export const ranks: Rank[] = [
  {
    title: "Beginner",
    from: 0,
    to: 1.6999999,
  },
  {
    title: "Upper Beginner",
    from: 1.7,
    to: 2.6999999,
  },
  {
    title: "Intermediate",
    from: 2.7,
    to: 3.4999999,
  },
  {
    title: "Upper Intermediate",
    from: 3.5,
    to: 4.4999999,
  },
  {
    title: "Advanced",
    from: 4.5,
    to: 5.9999999,
  },
  {
    title: "Pro",
    from: 6,
    to: 6.9999999,
  },
] as const;
