import { useQuery } from "@tanstack/react-query";
import { getClubs } from "../clubs";
import { useAuthStore } from "../../shared/stores/auth.store";

export const useGetMyClubs = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["my-clubs"],
    queryFn: () => getClubs(token ?? ""),
    enabled: !!token,
  });
};
