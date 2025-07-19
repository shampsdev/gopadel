import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import { deleteEvent } from "../../../events";

export const useDeleteEvent = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(token!, eventId),
    mutationKey: ["events"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
