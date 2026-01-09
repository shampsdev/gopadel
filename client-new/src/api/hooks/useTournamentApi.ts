import { useState } from 'react';

interface TournamentConfig {
  type: string;
  format: 'AMERICANO' | 'MEXICANO';
  mode: 'SOLO' | 'PAIR';
  matchPoints: number;
  courtsCount: number;
  currentRound: number;
  totalRounds: number;
  settings: {
    autoAdvanceRounds: boolean;
    allowDraws: boolean;
    finalEnabled: boolean;
  };
}

interface Match {
  id: string;
  round: number;
  court: number;
  teamA: {
    player1: string;
    player2: string;
  };
  teamB: {
    player1: string;
    player2: string;
  };
  score?: {
    teamA: number;
    teamB: number;
  };
  status: 'scheduled' | 'in_progress' | 'completed';
}

interface PlayerStats {
  userId: string;
  position: number;
  stats: {
    wins: number;
    draws: number;
    losses: number;
    scored: number;
    conceded: number;
    diff: number;
    tablePoints: number;
    wdlPoints: number;
  };
}

interface TournamentState {
  currentRound: number;
  totalRounds: number;
  matches: Match[];
  leaderboard: PlayerStats[];
  canAdvance: boolean;
}

export const useTournamentApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  });

  const createTournament = async (eventId: string, config: TournamentConfig, participants: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/tournaments/${eventId}/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          config,
          participants,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tournament');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const startTournament = async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/tournaments/${eventId}/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to start tournament');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTournamentState = async (eventId: string): Promise<TournamentState> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/tournaments/${eventId}/state`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to get tournament state');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMatchScore = async (eventId: string, matchId: string, teamAScore: number, teamBScore: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/tournaments/${eventId}/matches/${matchId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          score: {
            teamA: teamAScore,
            teamB: teamBScore,
          },
          status: 'completed',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update match score');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const advanceToNextRound = async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/tournaments/${eventId}/next-round`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to advance to next round');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeTournament = async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/tournaments/${eventId}/finalize`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to finalize tournament');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createTournament,
    startTournament,
    getTournamentState,
    updateMatchScore,
    advanceToNextRound,
    finalizeTournament,
  };
};
