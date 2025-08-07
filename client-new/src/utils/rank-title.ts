import { ranks } from "../shared/constants/ranking";

export const getRankTitle = (rankValue: number) => {
  const rank = ranks.find((r) => r.from <= rankValue && r.to >= rankValue);
  return rank?.title || "Неизвестный уровень";
};
