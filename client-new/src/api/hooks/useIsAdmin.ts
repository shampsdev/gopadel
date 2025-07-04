import { useQuery } from "@tanstack/react-query";
import { isAdmin } from "../user";
import { useAuthStore } from "../../shared/stores/auth.store";

export const useIsAdmin = () => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => isAdmin(token!),
    enabled: !!token,
  });
};
