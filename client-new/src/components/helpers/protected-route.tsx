import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../shared/stores/auth.store";
import { useEffect } from "react";
import { useGetMe } from "../../api/hooks/useGetMe";
import { useGetMyClubs } from "../../api/hooks/useGetMyClubs";
import { useJoinClub } from "../../api/hooks/mutations/clubs/useJoinClub";
import { Preloader } from "../widgets/preloader";
import { initDataStartParam } from "@telegram-apps/sdk-react";
import { parseStartParam } from "../../utils/start-data-parse";

export const ProtectedRoute = () => {
  const { setAuth, setUser } = useAuthStore();
  const { data: me, isLoading, isError, isFetched } = useGetMe();
  const { data: myClubs, isLoading: clubsLoading } = useGetMyClubs();
  const joinClubMutation = useJoinClub();
  const initData = initDataStartParam();

  useEffect(() => {
    if (!isLoading && !isError) {
      setAuth(true);
      setUser(me ?? null);
    }
  }, [isLoading, isError, setAuth]);

  useEffect(() => {
    if (me?.isRegistered && !clubsLoading && myClubs && initData) {
      const parsedData = parseStartParam(initData);

      if (parsedData.courtId) {
        const clubExists = myClubs.some(
          (club) => club.id === parsedData.courtId
        );

        if (!clubExists) {
          joinClubMutation.mutate(parsedData.courtId);
        }
      } else {
        const globalClubExists = myClubs.some((club) => club.id === "global");

        if (!globalClubExists) {
          joinClubMutation.mutate("global");
        }
      }
    }
  }, [me?.isRegistered, clubsLoading, myClubs, initData]);

  if (isLoading || clubsLoading) {
    return <Preloader />;
  }

  if (isError) {
    return <Navigate to="/about" />;
  }

  if (!me?.isRegistered && isFetched) {
    return <Navigate to="/registration" />;
  }

  return <Outlet />;
};
