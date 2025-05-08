import useUserStore from "../stores/userStore"
import { Navigate, Outlet } from "react-router-dom"
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useUserStore()
  if (isLoading) {
    return null
  }
  if (!isAuthenticated) {
    return <Navigate to="/register" />
  }
  return <Outlet />
}

export default ProtectedRoute
