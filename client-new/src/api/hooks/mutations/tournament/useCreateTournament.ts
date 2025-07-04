import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTournament } from "../../../tournaments";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import type { CreateTournament } from "../../../../types/create-tournament";

export const useCreateTournament = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tournament: CreateTournament) =>
      createTournament(token!, tournament),
    mutationKey: ["tournaments"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
