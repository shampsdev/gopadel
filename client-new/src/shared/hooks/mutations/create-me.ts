import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/auth.store";
import { createMe } from "../../../api/user";

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
