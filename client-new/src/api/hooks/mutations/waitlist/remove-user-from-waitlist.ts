import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeUserFromWaitlist } from "../../../events";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useRemoveUserFromWaitlist = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentId: string) =>
      removeUserFromWaitlist(token!, tournamentId),
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: ["tournament-waitlist", tournamentId],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
