import type { Event } from "../types/event.type";
import { EventType } from "../types/event-type.type";

export const getEventType = (event: Event): string => {
  switch (event.type) {
    case EventType.tournament:
      return event.data?.tournament?.type ?? "";
    case EventType.game:
      return event.data?.game?.type ?? "";
    case EventType.training:
      return event.data?.training?.type ?? "";
    default:
      return "";
  }
};
