import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuthStore } from "../../shared/stores/auth.store";
import { useGetMe } from "../../shared/hooks/useGetMe";

export const ProtectedRoute = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const { data: me, isLoading, error } = useGetMe();

  useEffect(() => {
    if (!token) {
      return;
    }

    if (error && !isLoading) {
      navigate("/about", { replace: true });
      return;
    }
  }, [token, error, isLoading, navigate]);

  if (isLoading) return <div>Загрузка...</div>;

  if (!token || !me) return null;

  return <Outlet />;
};
