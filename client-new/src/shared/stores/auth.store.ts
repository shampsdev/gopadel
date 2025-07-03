import { create } from "zustand";
import type { User } from "../../types/user.type";

interface AuthState {
  auth: boolean;
  token: string | null;
  user: User | null;
  isInitialized: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  setAuth: (auth: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  auth: false,
  token: null,
  user: null,
  isInitialized: false,
  setToken: (token: string) => {
    set({ token });
  },
  setUser: (user: User | null) => {
    set({ user: user ?? null });
  },
  setAuth: (auth: boolean) => {
    set({ auth });
  },
}));
