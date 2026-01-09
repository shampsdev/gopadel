import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { counterApi } from "../counter";
import { useAuthStore } from "../../shared/stores/auth.store";
import type {
  InitializeTournamentRequest,
  UpdateMatchScoreRequest,
} from "../../types/counter.type";

// Получение состояния турнира
export const useGetTournamentState = (eventId: string) => {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: ["tournament-state", eventId],
    queryFn: () => counterApi.getState(eventId, token!),
    enabled: !!eventId && !!token,
    retry: (failureCount, error: any) => {
      // Не повторяем запрос, если турнир не инициализирован
      if (error?.response?.data?.error?.includes("tournament not initialized")) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Инициализация турнира
export const useInitializeTournament = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  
  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: InitializeTournamentRequest;
    }) => counterApi.initialize(eventId, data, token!),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-state", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
    },
  });
};

// Обновление счета матча
export const useUpdateMatchScore = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  
  return useMutation({
    mutationFn: ({
      eventId,
      matchId,
      data,
    }: {
      eventId: string;
      matchId: string;
      data: UpdateMatchScoreRequest;
    }) => counterApi.updateMatchScore(eventId, matchId, data, token!),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-state", eventId] });
    },
  });
};

// Начать следующий раунд
export const useNextRound = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  
  return useMutation({
    mutationFn: (eventId: string) => counterApi.nextRound(eventId, token!),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-state", eventId] });
    },
  });
};

// Завершить турнир
export const useFinishTournament = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  
  return useMutation({
    mutationFn: (eventId: string) => counterApi.finish(eventId, token!),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-state", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
    },
  });
};
