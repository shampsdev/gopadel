import useUserStore from "@/stores/userStore"
import { getMe } from "@/api/api"

export default function useAuth() {
  const userStore = useUserStore()
  const checkAuth = async () => {
    const userData = await getMe()
    if (userData?.is_registered) {
      userStore.authenticate()
      userStore.setIsLoading(false)
      userStore.updateUserData(userData)
    } else {
      userStore.setIsLoading(false)
    }
  }

  return { checkAuth }
}
