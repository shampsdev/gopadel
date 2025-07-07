import { useQuery } from "@tanstack/react-query";
import { getBio } from "../user";
import { useAuthStore } from "../../shared/stores/auth.store";

export const useGetBio = () => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["bio"],
    queryFn: () => getBio(token!),
    enabled: !!token,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
