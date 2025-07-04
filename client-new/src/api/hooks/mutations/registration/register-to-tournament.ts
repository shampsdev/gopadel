import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerToTournament } from "../../../registrations";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useRegisterToTournament = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentId: string) =>
      registerToTournament(token!, tournamentId),
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: ["my-registrations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tournaments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tournament-waitlist", tournamentId],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
