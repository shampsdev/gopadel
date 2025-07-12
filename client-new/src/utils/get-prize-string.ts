import type { Prize } from "../types/prize.type";

export const getPrizeString = (prize: Prize | undefined) => {
  switch (prize) {
    case 1:
      return "1 место";
    case 2:
      return "2 место";
    case 3:
      return "3 место";
    default:
      return "участник";
  }
};
