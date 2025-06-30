import type { User } from "@telegram-apps/sdk-react";
import { create } from "zustand";

interface AuthState {
  auth: boolean;
  token: string | null;
  user: User | null;
}

interface AuthActions {
  login: (user: User, token: string) => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  auth: false,
  token: null,
  user: null,
  login: (user: User) => {
    set({ auth: true, user });
  },
  setToken: (token: string) => {
    set({ token });
  },
  setUser: (user: User) => {
    set({ user: { ...user } });
  },
}));
