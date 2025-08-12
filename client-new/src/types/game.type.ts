import type { EventResult } from "./event-result.type";
import type { Event } from "./event.type";

export interface Game extends Event {
  data: {
    result?: EventResult;
    game: {
      type: string;
    };
  };
}
