import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../events";
import { useAuthStore } from "../../shared/stores/auth.store";
import type { FilterEvent } from "../../types/filter.type";

export const useGetEvents = (filter: FilterEvent) => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["events", filter],
    queryFn: () => getEvents(token ?? "", filter),
    enabled: !!token,
  });
};
