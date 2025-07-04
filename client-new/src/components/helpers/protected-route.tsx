import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../shared/stores/auth.store";
import { useEffect } from "react";
import { useGetMe } from "../../api/hooks/useGetMe";
import { Preloader } from "../widgets/preloader";
import { useClubJoinConditional } from "../../shared/hooks/useClubJoinConditional";

export const ProtectedRoute = () => {
  const { setAuth, setUser } = useAuthStore();
  const { data: me, isLoading, isError, isFetched } = useGetMe();

  const { isLoading: clubJoinLoading } = useClubJoinConditional({
    enabled: !!me?.id,
    user: me,
  });

  useEffect(() => {
    if (!isLoading && !isError) {
      setAuth(true);
      setUser(me ?? null);
    }
  }, [isLoading, isError, setAuth]);

  if (isLoading || clubJoinLoading) {
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
