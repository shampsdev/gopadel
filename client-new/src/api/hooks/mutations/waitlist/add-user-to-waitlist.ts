import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUserToWaitlist } from "../../../events";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useAddUserToWaitlist = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentId: string) =>
      addUserToWaitlist(token!, tournamentId),
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
