import { api } from "./axios.instance";
import type {
  InitializeTournamentRequest,
  UpdateMatchScoreRequest,
  TournamentStateResponse,
  NextRoundResponse,
  FinishTournamentResponse,
} from "../types/counter.type";

export const counterApi = {
  // Инициализация турнирного счетчика
  initialize: async (
    eventId: string,
    data: InitializeTournamentRequest,
    token: string
  ): Promise<TournamentStateResponse> => {
    const response = await api.post(
      `/events/${eventId}/counter/initialize`,
      data,
      {
        headers: {
          "X-Api-Token": token,
        },
      }
    );
    return response.data;
  },

  // Получение состояния турнира
  getState: async (eventId: string, token: string): Promise<TournamentStateResponse> => {
    const response = await api.get(`/events/${eventId}/counter`, {
      headers: {
        "X-Api-Token": token,
      },
    });
    return response.data;
  },

  // Обновление счета матча
  updateMatchScore: async (
    eventId: string,
    matchId: string,
    data: UpdateMatchScoreRequest,
    token: string
  ): Promise<TournamentStateResponse> => {
    const response = await api.put(
      `/events/${eventId}/counter/matches/${matchId}/score`,
      data,
      {
        headers: {
          "X-Api-Token": token,
        },
      }
    );
    return response.data;
  },

  // Начать следующий раунд
  nextRound: async (eventId: string, token: string): Promise<NextRoundResponse> => {
    const response = await api.post(
      `/events/${eventId}/counter/next-round`,
      {},
      {
        headers: {
          "X-Api-Token": token,
        },
      }
    );
    return response.data;
  },

  // Завершить турнир
  finish: async (eventId: string, token: string): Promise<FinishTournamentResponse> => {
    const response = await api.post(
      `/events/${eventId}/counter/finish`,
      {},
      {
        headers: {
          "X-Api-Token": token,
        },
      }
    );
    return response.data;
  },
};
