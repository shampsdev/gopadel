import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import type { PatchTournament } from "../../../../types/patch-tournament";
import { patchTournament } from "../../../tournaments";

export const usePatchTournament = (tournamentId: string) => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tournament: PatchTournament) =>
      patchTournament(token!, tournamentId, tournament),
    mutationKey: ["tournaments"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
