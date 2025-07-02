import { useQuery } from "@tanstack/react-query";
import { getMyRegistrations } from "../registrations";
import { useAuthStore } from "../../shared/stores/auth.store";

export const useGetMyRegistrations = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["my-registrations"],
    queryFn: () => getMyRegistrations(token ?? ""),
  });
};
