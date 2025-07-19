import type { CreateEvent } from "../types/create-event.type";
import type { Event } from "../types/event.type";
import type { FilterEvent } from "../types/filter.type";
import type { PatchEvent } from "../types/patch-tournament";
import type { Waitlist, WaitlistUser } from "../types/waitlist.type";
import { api } from "./axios.instance";

export const getEvents = async (
  token: string,
  filter: FilterEvent
): Promise<Event[] | null> => {
  const response = await api.post("/events/filter", filter, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const getEventWaitlist = async (
  token: string,
  id: string
): Promise<WaitlistUser | null> => {
  const response = await api.get(`/events/${id}/waitlist`, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const addUserToWaitlist = async (
  token: string,
  tournamentId: string
): Promise<Waitlist | null> => {
  const response = await api.post(
    `/tournaments/${tournamentId}/waitlist`,
    {},
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );
  return response.data;
};

export const removeUserFromWaitlist = async (
  token: string,
  tournamentId: string
): Promise<Waitlist | null> => {
  const response = await api.delete(`/tournaments/${tournamentId}/waitlist`, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const createEvent = async (
  token: string,
  event: CreateEvent
): Promise<Event | null> => {
  const response = await api.post("/events", event, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const patchEvent = async (
  token: string,
  eventId: string,
  event: PatchEvent
): Promise<Event | null> => {
  const response = await api.patch(`/events/${eventId}`, event, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const deleteEvent = async (
  token: string,
  eventId: string
): Promise<boolean> => {
  const response = await api.delete(`/events/${eventId}`, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.status === 204;
};
