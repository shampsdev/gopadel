import { create } from "zustand";
import type { User } from "../../types/user.type";

interface AuthState {
  auth: boolean;
  token: string | null;
  user: User | null;
}

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setAuth: (auth: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  auth: false,
  token: null,
  user: null,
  setToken: (token: string) => {
    set({ token });
  },
  setUser: (user: User) => {
    set({ user: { ...user } });
  },
  setAuth: (auth: boolean) => {
    set({ auth });
  },
}));
