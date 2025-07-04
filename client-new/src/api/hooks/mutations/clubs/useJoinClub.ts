import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinClub } from "../../../clubs";
import { useAuthStore } from "../../../../shared/stores/auth.store";

export const useJoinClub = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clubId: string) => joinClub(clubId, token ?? ""),
    mutationKey: ["my-clubs"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-clubs"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
