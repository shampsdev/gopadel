import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelRegistrationAfterPayment } from "../../../registrations";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useCancelRegistrationAfterPayment = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentId: string) =>
      cancelRegistrationAfterPayment(token!, tournamentId),
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
