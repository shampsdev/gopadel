import type { Event } from "../types/event.type";

export const checkOrganizerRight = (
  isAdmin: boolean,
  userId: string,
  event: Event
): boolean => {
  return isAdmin && event.organizer.id === userId;
};
