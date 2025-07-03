import type { User } from "../types/user.type";
import type { Waitlist } from "../types/waitlist.type";
import type { Tournament as TournamentType } from "../types/tournament.type";

export const isTournamentFinished = (tournament: TournamentType) => {
  if (!tournament.endTime) return false;
  const now = new Date();
  const endTime = new Date(tournament.endTime);
  return now > endTime;
};

export const participatingAvailable = (tournament: TournamentType) => {
  return (
    tournament.maxUsers >
    tournament.participants.filter(
      (participant) => participant.status === "ACTIVE"
    ).length
  );
};

export const isUserRegistered = (tournament: TournamentType, user: User) => {
  return tournament.participants.some(
    (participant) => participant.user.id === user.id
  );
};

export const isUserInWaitlist = (waitlist: Waitlist, user: User) => {
  return waitlist.some((waitlist) => waitlist.user.id === user.id);
};

export const isRankAllowed = (tournament: TournamentType, user: User) => {
  console.log(
    "RANK CHECNIKG:",
    tournament.rankMin !== null &&
      tournament.rankMin !== undefined &&
      tournament.rankMax !== null &&
      tournament.rankMax !== undefined &&
      user.rank !== null &&
      user.rank !== undefined &&
      tournament.rankMin <= user.rank &&
      user.rank < tournament.rankMax,
    tournament.rankMin,
    tournament.rankMax,
    user.rank
  );
  return (
    tournament.rankMin !== null &&
    tournament.rankMin !== undefined &&
    tournament.rankMax !== null &&
    tournament.rankMax !== undefined &&
    user.rank !== null &&
    user.rank !== undefined &&
    tournament.rankMin <= user.rank &&
    user.rank < tournament.rankMax
  );
};

export const isUserRegisteredAndPaymentProceeded = (
  tournament: TournamentType,
  user: User
) => {
  return tournament.participants.some(
    (participant) =>
      participant.user.id === user.id && participant.status === "ACTIVE"
  );
};

export const userHasRegisteredAndHasNotPaid = (
  tournament: TournamentType,
  user: User
) => {
  return tournament.participants.some(
    (participant) =>
      participant.user.id === user.id && participant.status === "PENDING"
  );
};

export const isUserCancelledParticipating = (
  tournament: TournamentType,
  user: User
) => {
  return tournament.participants.some(
    (participant) =>
      participant.user.id === user.id &&
      participant.status === "CANCELED_BY_USER"
  );
};
