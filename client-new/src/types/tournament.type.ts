import type { EventResult } from "./event-result.type";
import type { Event } from "./event.type";

export interface Tournament extends Event {
  data: {
    result?: EventResult;
    tournament: {
      type: string;
    };
  };
}
