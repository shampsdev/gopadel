import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import type { CreateEvent } from "../../../../types/create-event.type";
import { createEvent } from "../../../events";

export const useCreateEvent = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event: CreateEvent) => createEvent(token!, event),
    mutationKey: ["events"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
