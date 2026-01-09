import type { PlayerPlace } from "./player-place.type";

export interface EventResult {
  leaderboard: PlayerPlace[];
  status?: "in_progress" | "completed";
  updatedAt?: string;
  completedAt?: string;
  winner?: any;
}
