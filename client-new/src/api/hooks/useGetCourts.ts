import { useQuery } from "@tanstack/react-query";
import { getCourts } from "../courts";
import { useAuthStore } from "../../shared/stores/auth.store";

export const useGetCourts = () => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["courts"],
    queryFn: () => getCourts(token!),
    enabled: !!token,
  });
};
