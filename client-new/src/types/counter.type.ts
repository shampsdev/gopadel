export type TournamentFormat = "AMERICANO" | "MEXICANO";
export type TournamentMode = "SOLO" | "PAIR";
export type TournamentEngineStatus = "NOT_STARTED" | "ACTIVE" | "PAUSED" | "FINISHED";
export type MatchStatus = "pending" | "in_progress" | "completed";

export interface TournamentConfig {
  matchPoints: number;
  courtsCount: number;
  roundsCount: number;
}

export interface TournamentStats {
  wins: number;
  draws: number;
  losses: number;
  scored: number;
  conceded: number;
  diff: number;
  tablePoints: number;
  wdlPoints: number;
}

export interface TournamentPlayer {
  id: string;
  name: string;
  rank: number;
  seed: number;
  stats: TournamentStats;
}

export interface MatchTeam {
  player1: string;
  player2?: string;
  score: number;
}

export interface TournamentMatch {
  id: string;
  round: number;
  court: number;
  teamA: MatchTeam;
  teamB: MatchTeam;
  status: MatchStatus;
  startTime?: string;
  endTime?: string;
}

export interface LeaderboardEntry {
  position: number;
  userId: string;
  stats: TournamentStats;
}

export interface TournamentState {
  status: TournamentEngineStatus;
  currentRound: number;
}

export interface TournamentEngine {
  config: TournamentConfig;
  state: TournamentState;
  participants: TournamentPlayer[];
  matches: TournamentMatch[];
  leaderboard: LeaderboardEntry[];
}

export interface TournamentData {
  format: TournamentFormat;
  mode: TournamentMode;
}

export interface CounterEventData {
  domain: "tournament";
  tournament: TournamentData;
  tournamentEngine: TournamentEngine;
  result?: {
    leaderboard: LeaderboardEntry[];
  };
}

// API Request/Response types
export interface InitializeTournamentRequest {
  format: TournamentFormat;
  mode: TournamentMode;
  matchPoints: number;
  courtsCount: number;
}

export interface UpdateMatchScoreRequest {
  teamA: { score: number };
  teamB: { score: number };
}

export interface TournamentStateResponse {
  format: TournamentFormat;
  mode: TournamentMode;
  currentRound: number;
  totalRounds: number;
  status: TournamentEngineStatus;
  participants: TournamentPlayer[];
  matches: TournamentMatch[];
  leaderboard: LeaderboardEntry[];
}

export interface NextRoundResponse {
  round: number;
  matches: TournamentMatch[];
}

export interface FinishTournamentResponse {
  finalLeaderboard: LeaderboardEntry[];
  winner?: TournamentPlayer;
}
