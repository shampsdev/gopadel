import { useQuery } from "@tanstack/react-query";
import { getLoyalties } from "../loyalty";
import { useAuthStore } from "../../shared/stores/auth.store";

export const useGetLoyalties = () => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["loyalties"],
    queryFn: () => getLoyalties(token ?? ""),
    enabled: !!token,
  });
};
