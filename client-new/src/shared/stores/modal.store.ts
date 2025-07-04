import { create } from "zustand";

interface ModalStore {
  isModalOpened: boolean;
  openModal: ({
    title,
    subtitle,
    declineButtonText,
    acceptButtonText,
    declineButtonOnClick,
    acceptButtonOnClick,
  }: {
    title: string;
    subtitle: string;
    declineButtonText: string;
    acceptButtonText: string;
    declineButtonOnClick: () => void;
    acceptButtonOnClick: () => void;
  }) => void;
  closeModal: () => void;
  toggleModal: () => void;
  title: string;
  subtitle: string;
  declineButtonText: string;
  acceptButtonText: string;
  declineButtonOnClick: () => void;
  acceptButtonOnClick: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isModalOpened: false,
  openModal: ({
    title,
    subtitle,
    declineButtonText,
    acceptButtonText,
    declineButtonOnClick,
    acceptButtonOnClick,
  }) =>
    set({
      isModalOpened: true,
      title,
      subtitle,
      declineButtonText,
      acceptButtonText,
      declineButtonOnClick,
      acceptButtonOnClick,
    }),
  closeModal: () =>
    set({
      isModalOpened: false,
      title: "",
      subtitle: "",
      declineButtonText: "",
      acceptButtonText: "",
      declineButtonOnClick: () => {},
      acceptButtonOnClick: () => {},
    }),
  toggleModal: () =>
    set((state) => ({
      isModalOpened: !state.isModalOpened,
      title: "",
      subtitle: "",
      declineButtonText: "",
      acceptButtonText: "",
      declineButtonOnClick: () => {},
      acceptButtonOnClick: () => {},
    })),
  title: "",
  subtitle: "",
  declineButtonText: "",
  acceptButtonText: "",
  declineButtonOnClick: () => {},
  acceptButtonOnClick: () => {},
}));
