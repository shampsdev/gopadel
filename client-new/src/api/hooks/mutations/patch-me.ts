import { useMutation } from "@tanstack/react-query";
import { patchMe } from "../../../api/user";
import type { PatchUser } from "../../../types/patch-user.type";
import { useAuthStore } from "../../../shared/stores/auth.store";

export const usePatchMe = () => {
  const { token, setUser, auth } = useAuthStore();

  return useMutation({
    mutationFn: (user: PatchUser) => patchMe(token ?? "", user),
    onSuccess: (user) => {
      if (user) setUser(user);
    },
  });
};
