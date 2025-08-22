import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUserToWaitlist } from "../../../events";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useAddUserToWaitlist = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => addUserToWaitlist(token!, eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({
        queryKey: ["my-registrations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["waitlist", eventId],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
