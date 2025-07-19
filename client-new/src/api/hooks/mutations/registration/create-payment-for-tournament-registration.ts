import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import { createPaymentForEventRegistration } from "../../../registrations";

export const useCreatePaymentForTournamentRegistration = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tournamentId,
      returnUrl,
    }: {
      tournamentId: string;
      returnUrl: string;
    }) =>
      createPaymentForEventRegistration(token ?? "", tournamentId, returnUrl),
    onSuccess: (_, { tournamentId }) => {
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
