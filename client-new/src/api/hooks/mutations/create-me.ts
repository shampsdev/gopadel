import { useMutation } from "@tanstack/react-query";
import { createMe } from "../../../api/user";
import { useAuthStore } from "../../../shared/stores/auth.store";

const useCreateMe = () => {
  const { token, setUser } = useAuthStore();

  return useMutation({
    mutationFn: () => createMe(token ?? ""),
    onSuccess: (user) => {
      if (user) setUser(user);
    },
  });
};

export default useCreateMe;
