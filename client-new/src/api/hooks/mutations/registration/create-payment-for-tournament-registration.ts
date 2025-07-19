import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import { createPaymentForEventRegistration } from "../../../registrations";

export const useCreatePaymentForTournamentRegistration = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      returnUrl,
    }: {
      eventId: string;
      returnUrl: string;
    }) => createPaymentForEventRegistration(token ?? "", eventId, returnUrl),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({
        queryKey: ["my-registrations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["event-waitlist", eventId],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
