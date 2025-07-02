import { useQuery } from "@tanstack/react-query";
import { getTournamentWaitlist } from "../tournaments";
import { useAuthStore } from "../../shared/stores/auth.store";

export const useGetTournamentWaitlist = (id: string) => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["tournament-waitlist", id],
    queryFn: () => getTournamentWaitlist(token ?? "", id),
  });
};
