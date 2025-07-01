import { useMutation } from "@tanstack/react-query";
import { patchMe } from "../../../api/user";
import { useAuthStore } from "../../stores/auth.store";
import type { PatchUser } from "../../../types/patch-user.type";

export const usePatchMe = () => {
  const { token, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (user: PatchUser) => patchMe(token ?? "", user),
    onSuccess: (user) => {
      if (user) setUser(user);
    },
  });
};
