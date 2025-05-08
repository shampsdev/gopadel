import { create } from "zustand"
import { User } from "../types/user"

interface UserState {
  isAuthenticated: boolean
  isLoading: boolean
  userData: User | null
  updateUserData: (userData: User) => void
  setIsLoading: (isLoading: boolean) => void
  authenticate: () => void
}

const useUserStore = create<UserState>((set) => ({
  userData: null,
  isLoading: true,
  isAuthenticated: false,
  authenticate: () => set(() => ({ isAuthenticated: true })),
  updateUserData: (userData: User) => set({ userData }),
  setIsLoading: (isLoading: boolean) => set(() => ({ isLoading: isLoading })),
}))
export default useUserStore
