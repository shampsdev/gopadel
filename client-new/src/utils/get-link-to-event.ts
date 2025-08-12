import type { EventType } from "../types/event-type.type";

export const getLinkToEvent = (eventId: string, eventType: EventType) => {
  switch (eventType) {
    case "tournament":
      return `/tournament/${eventId}`;
    case "training":
      return `/training/${eventId}`;
    case "game":
      return `/game/${eventId}`;
    default:
      return `/event/${eventId}`;
  }
};
