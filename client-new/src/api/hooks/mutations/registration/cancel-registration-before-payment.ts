import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import { cancelRegistrationBeforePayment } from "../../../registrations";

export const useCancelRegistrationBeforePayment = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) =>
      cancelRegistrationBeforePayment(token!, eventId),
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
