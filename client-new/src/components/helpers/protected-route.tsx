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
    const handleClubJoin = async () => {
      if (
        me !== undefined &&
        me !== null &&
        !clubsLoading &&
        myClubs &&
        initData &&
        initData.length > 0 &&
        !joinClubMutation.isPending
      ) {
        try {
          const parsedData = parseStartParam(initData);

          if (parsedData.courtId) {
            const clubExists = myClubs.some(
              (club) => club.id === parsedData.courtId
            );

            if (!clubExists) {
              await joinClubMutation.mutateAsync(parsedData.courtId);
            }
          } else {
            const globalClubExists = myClubs.some(
              (club) => club.id === "global"
            );

            if (!globalClubExists) {
              await joinClubMutation.mutateAsync("global");
            }
          }
        } catch (error) {
          console.error("Ошибка при присоединении к клубу:", error);
        }
      }
    };

    handleClubJoin();
  }, [me, clubsLoading, myClubs, initData, joinClubMutation.isPending]);

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
