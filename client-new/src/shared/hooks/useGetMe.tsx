import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api/user";
import { useAuthStore } from "../stores/auth.store";

export const useGetMe = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(token!),
    enabled: !!token,
  });
};
