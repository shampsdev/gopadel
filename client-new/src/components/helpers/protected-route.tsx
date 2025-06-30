import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuthStore } from "../../shared/stores/auth.store";

export const ProtectedRoute = () => {
  const { auth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) {
      navigate("/about", { replace: true });
    }
  }, [auth, navigate]);

  if (!auth) return null;
  return <Outlet />;
};
