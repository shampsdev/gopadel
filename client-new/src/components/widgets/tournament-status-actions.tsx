import type { Tournament } from "../../types/tournament.type";
import type { User } from "../../types/user.type";
import type { Waitlist } from "../../types/waitlist.type";
import {
  isRankAllowed,
  isTournamentFinished,
  isUserRegistered,
  participatingAvailable,
  userHasRegisteredAndHasNotPaid,
  isUserRegisteredAndPaymentProceeded,
  isUserCancelledParticipating,
  isUserInWaitlist,
} from "../../utils/tournament-status-checks";

interface TournamentStatusActionsProps {
  tournament: Tournament;
  user: User;
  waitlist: Waitlist;
}

export const TournamentStatusActions = ({
  tournament,
  user,
  waitlist,
}: TournamentStatusActionsProps) => {
  if (isTournamentFinished(tournament)) {
    return <div>TournamentFinished</div>;
  }

  if (participatingAvailable(tournament)) {
    if (isUserRegistered(tournament, user)) {
      if (isUserRegisteredAndPaymentProceeded(tournament, user)) {
        return (
          <div>
            Вы уже зарегистрированы и оплатили участие. Отказаться от участия
          </div>
        );
      }

      if (isUserCancelledParticipating(tournament, user)) {
        return <div>Вы отказались от участия</div>;
      }

      if (userHasRegisteredAndHasNotPaid(tournament, user)) {
        return <div>Оплатить | отказаться от участия</div>;
      }

      return <></>;
    }

    if (!isUserRegistered(tournament, user)) {
      if (isRankAllowed(tournament, user)) {
        return <div>Зарегистрироваться</div>;
      }

      if (!isRankAllowed(tournament, user)) {
        return <div>Ваш ранг не соответствует рангу турнира</div>;
      }
      return <></>;
    }
  }

  if (!participatingAvailable(tournament)) {
    if (isRankAllowed(tournament, user)) {
      if (isUserInWaitlist(waitlist, user)) {
        return <div>Вы в листе ожидания</div>;
      }
      if (!isUserInWaitlist(waitlist, user)) {
        return <div>Записаться в лист ожидания</div>;
      }
      return <></>;
    }

    if (!isRankAllowed(tournament, user)) {
      return <div>Ваш ранг не соответствует рангу турнира</div>;
    }
    return <></>;
  }

  return <></>;
};
// import type { Tournament } from "../../types/tournament.type";
// import type { User } from "../../types/user.type";
// import type { Waitlist } from "../../types/waitlist.type";
// import {
//   isRankAllowed,
//   isTournamentFinished,
//   isUserRegistered,
//   participatingAvailable,
//   userHasRegisteredAndHasNotPaid,
//   isUserRegisteredAndPaymentProceeded,
//   isUserCancelledParticipating,
//   isUserInWaitlist,
// } from "../../utils/tournament-status-checks";

// export const TournamentStatusActions = (
//   tournament: Tournament,
//   user: User,
//   waitlist: Waitlist
// ) => {
//   if (isTournamentFinished(tournament)) {
//     return <div>TournamentFinished</div>;
//   }

//   if (participatingAvailable(tournament)) {
//     if (isUserRegistered(tournament, user)) {
//       if (isUserRegisteredAndPaymentProceeded(tournament, user)) {
//         return (
//           <div>
//             Вы уже зарегистрированы и оплатили участие. Отказаться от участия
//           </div>
//         );
//       }

//       if (isUserCancelledParticipating(tournament, user)) {
//         return <div>Вы отказались от участия</div>;
//       }

//       if (userHasRegisteredAndHasNotPaid(tournament, user)) {
//         return <div>Оплатить | отказаться от участия</div>;
//       }
//     }

//     if (!isUserRegistered(tournament, user)) {
//       if (isRankAllowed(tournament, user)) {
//         return <div>Зарегистрироваться</div>;
//       }

//       if (!isRankAllowed(tournament, user)) {
//         return <div>Ваш ранг не соответствует рангу турнира</div>;
//       }
//     }
//   }

//   if (!participatingAvailable(tournament)) {
//     if (isRankAllowed(tournament, user)) {
//       if (isUserInWaitlist(waitlist, user)) {
//         return <div>Вы в листе ожидания</div>;
//       }
//       if (!isUserInWaitlist(waitlist, user)) {
//         return <div>Записаться в лист ожидания</div>;
//       }
//     }

//     if (!isRankAllowed(tournament, user)) {
//       return <div>Ваш ранг не соответствует рангу турнира</div>;
//     }
//   }
// };
