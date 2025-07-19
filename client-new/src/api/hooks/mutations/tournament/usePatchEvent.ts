import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../shared/stores/auth.store";
import type { PatchEvent } from "../../../../types/patch-tournament";
import { patchEvent } from "../../../events";

export const usePatchEvent = (eventId: string) => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event: PatchEvent) => patchEvent(token!, eventId, event),
    mutationKey: ["events"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
