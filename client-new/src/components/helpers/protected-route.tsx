import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../shared/stores/auth.store";
import { useEffect } from "react";
import { useGetMe } from "../../api/hooks/useGetMe";

export const ProtectedRoute = () => {
  const { setAuth } = useAuthStore();
  const { data: me, isLoading, isError, isFetched } = useGetMe();

  useEffect(() => {
    if (!isLoading && !isError) {
      setAuth(true);
    }
  }, [isLoading, isError, setAuth]);

  if (isLoading) {
    return null;
  }

  if (isError) {
    return <Navigate to="/about" />;
  }

  if (!me?.isRegistered && isFetched) {
    console.log("me", me);
    return <Navigate to="/registration" />;
  }
  return <Outlet />;
};
