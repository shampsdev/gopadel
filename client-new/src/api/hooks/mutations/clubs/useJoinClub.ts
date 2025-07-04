import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinClub } from "../../../clubs";
import { useRawInitData } from "@telegram-apps/sdk-react";

export const useJoinClub = () => {
  const initData = useRawInitData();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clubId: string) => joinClub(clubId, initData ?? ""),
    mutationKey: ["my-clubs"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-clubs"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
