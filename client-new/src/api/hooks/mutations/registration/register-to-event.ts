import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import { registerToEvent } from "../../../registrations";

export const useRegisterToEvent = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => registerToEvent(token!, eventId),
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
