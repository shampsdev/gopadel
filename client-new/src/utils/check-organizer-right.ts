import type { Tournament } from "../types/tournament.type";

export const checkOrganizerRight = (
  isAdmin: boolean,
  userId: string,
  tournament: Tournament
): boolean => {
  return isAdmin && tournament.organizator.id === userId;
};
