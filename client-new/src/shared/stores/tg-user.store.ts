import { create } from "zustand";

interface TgUserState {
  avatarUrl?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  setAvatarUrl: (url: string) => void;
  setUsername: (username: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
}

const useTgUserStore = create<TgUserState>((set) => ({
  avatarUrl: undefined,
  username: undefined,
  setAvatarUrl: (url: string) => set(() => ({ avatarUrl: url })),
  setUsername: (username: string) => set(() => ({ username: username })),
  setFirstName: (firstName: string) => set(() => ({ firstName: firstName })),
  setLastName: (lastName: string) => set(() => ({ lastName: lastName })),
}));

export default useTgUserStore;
