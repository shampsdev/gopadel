import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../user";
import { useAuthStore } from "../../shared/stores/auth.store";
import type { FilterUser } from "../../types/filter.type";

export const useGetUsers = (filter: FilterUser) => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["users", filter],
    queryFn: () => getUsers(token ?? "", filter),
    enabled: !!token,
  });
};
