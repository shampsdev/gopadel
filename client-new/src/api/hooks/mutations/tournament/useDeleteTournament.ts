import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import { deleteTournament } from "../../../tournaments";

export const useDeleteTournament = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tournamentId: string) =>
      deleteTournament(token!, tournamentId),
    mutationKey: ["tournaments"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
