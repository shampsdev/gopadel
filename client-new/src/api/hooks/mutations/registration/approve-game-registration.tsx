import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveRegistration } from "../../../registrations";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useApproveGameRegistration = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      approveRegistration(token!, eventId, userId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({
        queryKey: ["waitlist", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-registrations"],
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
