import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api/user";
import { useAuthStore } from "../../shared/stores/auth.store";

export const useGetMe = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(token!),
    enabled: !!token,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
