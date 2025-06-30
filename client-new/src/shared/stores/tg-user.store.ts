import { create } from "zustand";

interface TgUserState {
  avatarUrl?: string;
  username?: string;
  setAvatarUrl: (url: string) => void;
  setUsername: (username: string) => void;
}

const useTgUserStore = create<TgUserState>((set) => ({
  avatarUrl: undefined,
  username: undefined,
  setAvatarUrl: (url: string) => set(() => ({ avatarUrl: url })),
  setUsername: (username: string) => set(() => ({ username: username })),
}));

export default useTgUserStore;
