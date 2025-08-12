import { useQuery } from "@tanstack/react-query";
import { getMyClubs } from "../clubs";
import { useAuthStore } from "../../shared/stores/auth.store";

export const useGetMyClubs = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["my-clubs"],
    queryFn: () => getMyClubs(token ?? ""),
    enabled: !!token,
  });
};
