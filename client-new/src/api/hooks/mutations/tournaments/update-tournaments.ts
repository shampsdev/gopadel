import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import { updateTournament } from "../../../tournaments";
import type { PatchTournament } from "../../../../types/patch-tournament.type";

export const useUpdateTournament = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tournamentId,
      patchTournament,
    }: {
      tournamentId: string;
      patchTournament: PatchTournament;
    }) => updateTournament(token!, tournamentId, patchTournament),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
