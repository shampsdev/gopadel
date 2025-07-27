import type { User } from "../types/user.type";
import type { Waitlist } from "../types/waitlist.type";
import type { Event } from "../types/event.type";
import { EventStatus } from "../types/event-status.type";
import { RegistrationStatus } from "../types/registration-status";

export const isEventFinished = (event: Event) => {
  return (
    event.status === EventStatus.completed ||
    event.status === EventStatus.cancelled
  );
};

export const participatingAvailable = (event: Event) => {
  return event.status === EventStatus.registration;
};

export const isUserRegistered = (event: Event, user: User) => {
  return event.participants?.some(
    (participant) => participant.user.id === user.id
  );
};

export const isUserInWaitlist = (waitlist: Waitlist, user: User) => {
  return waitlist.some((waitlist) => waitlist.user.id === user.id);
};

export const isRankAllowed = (event: Event, user: User) => {
  return (
    event.rankMin !== null &&
    event.rankMin !== undefined &&
    event.rankMax !== null &&
    event.rankMax !== undefined &&
    user.rank !== null &&
    user.rank !== undefined &&
    event.rankMin <= user.rank &&
    user.rank < event.rankMax
  );
};

export const isUserInvited = (event: Event, user: User) => {
  return event.participants?.some(
    (participant) =>
      participant.user.id === user.id &&
      participant.status === RegistrationStatus.INVITED
  );
};

export const isUserApproved = (event: Event, user: User) => {
  return event.participants?.some(
    (participant) =>
      participant.user.id === user.id &&
      participant.status === RegistrationStatus.CONFIRMED
  );
};

export const isUserCancelledParticipating = (event: Event, user: User) => {
  return event.participants?.some(
    (participant) =>
      participant.user.id === user.id &&
      participant.status === RegistrationStatus.LEFT
  );
};
