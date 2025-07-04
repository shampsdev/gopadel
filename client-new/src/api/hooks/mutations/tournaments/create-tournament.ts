import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tournament } from "../../../../types/tournament.type";
import { createTournament } from "../../../tournaments";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useCreateTournament = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournament: Tournament) =>
      createTournament(token!, tournament),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
