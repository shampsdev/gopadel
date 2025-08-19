import { create } from "zustand";
import { EventStatus } from "../../types/event-status.type";
import { ranks } from "../constants/ranking";
import {
  formatDateInput,
  formatTimeInput,
  validateDateFormat,
  validateTimeFormat,
} from "../../utils/date-format";
import { createStartAndEndTime } from "../../utils/date-format";
import type { PatchEvent } from "../../types/patch-tournament";

interface GameEditState {
  // Основная информация
  title: string;
  description: string;

  // Дата и время
  date: string;
  dateError: boolean;
  selectedDate: Date | null;
  time: string;
  timeError: boolean;

  // Место проведения
  clubName: string;
  clubAddress: string;
  type: string;
  courtId: string;

  // Уровень
  rankMin: number | null;
  rankMax: number | null;
  rankMinInput: string;
  rankMaxInput: string;
  rankMinError: boolean;
  rankMaxError: boolean;

  // Дополнительная информация
  price: number;
  priceInput: string;
  maxUsers: number;
  maxUsersInput: string;
  status: EventStatus | null;

  // Методы
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;

  setDate: (date: string) => void;
  setDateFromCalendar: (newDate: Date) => void;
  setDateError: (error: boolean) => void;

  setTime: (time: string) => void;
  setTimeError: (error: boolean) => void;

  setClubName: (name: string) => void;
  setClubAddress: (address: string) => void;
  setType: (type: string) => void;
  setCourtId: (id: string) => void;

  setRankMinValue: (value: number) => void;
  setRankMaxValue: (value: number) => void;

  setPriceInput: (price: string) => void;
  handlePriceBlur: () => void;

  setMaxUsersInput: (users: string) => void;
  handleMaxUsersBlur: () => void;

  setStatus: (status: EventStatus | null) => void;

  resetStore: () => void;
  loadFromEvent: (event: any) => void;
  loadedFromEvent: boolean;
  isFormValid: () => boolean;
  getGameData: () => PatchEvent | null;
}

export const useGameEditStore = create<GameEditState>((set, get) => ({
  // Основная информация
  title: "",
  description: "",

  // Дата и время
  date: "",
  dateError: false,
  selectedDate: null,
  time: "",
  timeError: false,

  // Место проведения
  clubName: "",
  clubAddress: "",
  type: "",
  courtId: "",

  // Уровень
  rankMin: null,
  rankMax: null,
  rankMinInput: "",
  rankMaxInput: "",
  rankMinError: false,
  rankMaxError: false,

  // Дополнительная информация
  price: 0,
  priceInput: "",
  maxUsers: 0,
  maxUsersInput: "",
  status: null,
  loadedFromEvent: false,

  // Методы
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),

  setDate: (value) => {
    const formatted = formatDateInput(value);

    set({ date: formatted });

    if (validateDateFormat(formatted)) {
      set({ dateError: false });
      // Обновляем selectedDate при ручном вводе даты
      const [day, month, year] = formatted.split(".");
      const newDate = new Date(
        2000 + parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
      set({ selectedDate: newDate });
    } else {
      set({ dateError: formatted.length > 0 });
    }
  },

  setDateFromCalendar: (newDate) => {
    set({ selectedDate: newDate });
    const formattedDate = newDate
      .toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, ".");
    set({ date: formattedDate, dateError: false });
  },

  setDateError: (error) => set({ dateError: error }),

  setTime: (value) => {
    const formatted = formatTimeInput(value);
    set({
      time: formatted,
      timeError: formatted.length > 0 && !validateTimeFormat(formatted),
    });
  },

  setTimeError: (error) => set({ timeError: error }),

  setClubName: (clubName) => set({ clubName }),
  setClubAddress: (clubAddress) => set({ clubAddress }),
  setType: (type) => set({ type }),
  setCourtId: (courtId) => set({ courtId }),

  setRankMinValue: (value) => {
    set({ rankMin: value });
    const selectedRank = ranks.find((r) => r.from === value);
    if (selectedRank) {
      set({
        rankMinInput: selectedRank.title,
        rankMinError: false,
      });

      const { rankMax } = get();
      if (rankMax !== null && value > rankMax) {
        set({ rankMaxError: true });
      } else {
        set({ rankMaxError: false });
      }
    }
  },

  setRankMaxValue: (value) => {
    set({ rankMax: value });
    const selectedRank = ranks.find((r) => r.from === value);
    if (selectedRank) {
      set({
        rankMaxInput: selectedRank.title,
        rankMaxError: false,
      });

      const { rankMin } = get();
      if (rankMin !== null && value < rankMin) {
        set({ rankMinError: true });
      } else {
        set({ rankMinError: false });
      }
    }
  },

  setPriceInput: (raw) => {
    const sanitized = raw.replace(/[^\d]/g, "");

    set({ priceInput: sanitized });

    if (sanitized) {
      set({ price: parseInt(sanitized) });
    } else {
      set({ price: 0 });
    }
  },

  handlePriceBlur: () => {
    const { priceInput } = get();
    // При потере фокуса форматируем число
    if (priceInput && /^\d+$/.test(priceInput)) {
      const num = parseInt(priceInput);
      set({
        price: num,
        priceInput: String(num),
      });
    } else {
      set({
        price: 0,
        priceInput: "",
      });
    }
  },

  setMaxUsersInput: (raw) => {
    const sanitized = raw.replace(/[^\d]/g, "");

    set({ maxUsersInput: sanitized });

    if (sanitized) {
      set({ maxUsers: parseInt(sanitized) });
    } else {
      set({ maxUsers: 0 });
    }
  },

  handleMaxUsersBlur: () => {
    const { maxUsersInput } = get();
    // При потере фокуса форматируем число
    if (maxUsersInput && /^\d+$/.test(maxUsersInput)) {
      const num = parseInt(maxUsersInput);
      set({
        maxUsers: num,
        maxUsersInput: String(num),
      });
    } else {
      set({
        maxUsers: 0,
        maxUsersInput: "",
      });
    }
  },

  setStatus: (status) => set({ status }),

  resetStore: () => {
    set({
      title: "",
      description: "",
      date: "",
      dateError: false,
      selectedDate: null,
      time: "",
      timeError: false,
      clubName: "",
      clubAddress: "",
      type: "",
      courtId: "",
      rankMin: null,
      rankMax: null,
      rankMinInput: "",
      rankMaxInput: "",
      rankMinError: false,
      rankMaxError: false,
      price: 0,
      priceInput: "",
      maxUsers: 0,
      maxUsersInput: "",
      status: null,
      loadedFromEvent: false,
    });
  },

  loadFromEvent: (event) => {
    if (!event) return;

    set({ loadedFromEvent: true });

    set({
      title: event.name || "",
      description: event.description || "",
    });

    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);

    const formattedDate = startDate
      .toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, ".");

    const startTime = startDate.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const endTime = endDate.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

    set({
      date: formattedDate,
      selectedDate: new Date(event.startTime),
      time: `${startTime}-${endTime}`,
      clubName: event.court?.name || "",
      clubAddress: event.court?.address || "",
      type: event.data?.game?.type || "",
      courtId: event.court?.id || "",
    });

    const minRank = ranks.find(
      (r) => event.rankMin >= r.from && event.rankMin <= r.to
    );
    const maxRank = ranks.find(
      (r) => event.rankMax >= r.from && event.rankMax <= r.to
    );

    if (minRank) {
      set({
        rankMinInput: minRank.title,
        rankMin: minRank.from,
      });
    }

    if (maxRank) {
      set({
        rankMaxInput: maxRank.title,
        rankMax: maxRank.from,
      });
    }

    set({
      price: event.price,
      priceInput: event.price.toString(),
      maxUsers: event.maxUsers,
      maxUsersInput: event.maxUsers.toString(),
      status: event.status || EventStatus.registration,
    });
  },

  isFormValid: () => {
    const state = get();
    return !!(
      state.title &&
      state.date &&
      state.time &&
      validateDateFormat(state.date) &&
      validateTimeFormat(state.time) &&
      state.clubName &&
      state.clubAddress &&
      state.type &&
      state.courtId &&
      state.status !== null &&
      state.rankMin !== null &&
      state.rankMin >= 0 &&
      state.rankMax !== null &&
      state.rankMax >= 0 &&
      state.rankMax >= state.rankMin &&
      state.price !== null &&
      state.price >= 0 &&
      state.maxUsers !== null &&
      state.maxUsers > 0
    );
  },

  getGameData: () => {
    const state = get();

    if (!state.date || !state.time) {
      return null;
    }

    if (!validateDateFormat(state.date)) {
      return null;
    }

    if (!validateTimeFormat(state.time)) {
      return null;
    }

    if (!state.courtId) {
      return null;
    }

    const { startTime: start, endTime: end } = createStartAndEndTime(
      state.date,
      state.time
    );

    if (!start || !end) {
      return null;
    }

    return {
      courtId: state.courtId,
      description: state.description,
      endTime: end,
      maxUsers: state.maxUsers,
      name: state.title,
      price: state.price,
      rankMax: ranks.find((r) => r.title === state.rankMaxInput)?.to ?? 0,
      rankMin: ranks.find((r) => r.title === state.rankMinInput)?.from ?? 0,
      startTime: start,
      status: state.status || EventStatus.registration,
      data: { game: { type: state.type } },
    };
  },
}));
