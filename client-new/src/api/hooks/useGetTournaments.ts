import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "../tournaments";
import { useAuthStore } from "../../shared/stores/auth.store";
import type { FilterTournament } from "../../types/filter.type";

export const useGetTournaments = (filter: FilterTournament) => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["tournaments", filter],
    queryFn: () => getTournaments(token ?? "", filter),
    enabled: !!token,
  });
};
