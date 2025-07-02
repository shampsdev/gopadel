import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../shared/stores/auth.store";
import { useGetMe } from "../../shared/hooks/useGetMe";
import { useEffect } from "react";

export const ProtectedRoute = () => {
  const { setAuth } = useAuthStore();
  const { data: me, isLoading, isError } = useGetMe();

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

  if (!me?.isRegistered) {
    return <Navigate to="/registration" />;
  }
  return <Outlet />;
};
