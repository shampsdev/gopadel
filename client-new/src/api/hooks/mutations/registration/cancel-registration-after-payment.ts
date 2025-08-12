import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelRegistrationAfterPayment } from "../../../registrations";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useCancelRegistrationAfterPayment = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) =>
      cancelRegistrationAfterPayment(token!, eventId),
    onSuccess: (_, eventId) => {
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
