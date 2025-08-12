import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactivateCancelledRegistration } from "../../../registrations";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useReactivateCancelledRegistration = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) =>
      reactivateCancelledRegistration(token!, eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({
        queryKey: ["my-registrations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["event-waitlist", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["events"],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
