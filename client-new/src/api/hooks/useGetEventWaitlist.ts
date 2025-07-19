import { useQuery } from "@tanstack/react-query";
import { getEventWaitlist } from "../events";
import { useAuthStore } from "../../shared/stores/auth.store";

export const useGetTournamentWaitlist = (id: string) => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["tournament-waitlist", id],
    queryFn: () => getEventWaitlist(token ?? "", id),
    enabled: !!id && !!token,
  });
};
