import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactivateCancelledRegistration } from "../../../registrations";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useReactivateCancelledRegistration = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentId: string) =>
      reactivateCancelledRegistration(token!, tournamentId),
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: ["my-registrations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tournament-waitlist", tournamentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tournaments"],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
