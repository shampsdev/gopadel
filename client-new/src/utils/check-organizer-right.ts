import type { Event } from "../types/event.type";

export const checkOrganizerRight = (
  isAdmin: boolean,
  userId: string,
  event: Event
): boolean => {
  return isAdmin && event.organizer.id === userId;
};

export const checkGameOrganizerRight = (userId: string, event: Event) => {
  return event.organizer.id === userId;
};
