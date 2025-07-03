import { Icons } from "../../assets/icons";
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
import { Button } from "../ui/button";

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
    return (
      <div className="flex flex-col text-center gap-[18px]">
        <div className="mb-10 flex flex-row gap-4 justify-center">
          <Button
            className="flex flex-row items-center gap-3 bg-[#EBEDF0]"
            onClick={() => {}}
          >
            <p>Турнир завершен</p>
            <div className="flex flex-col items-center justify-center w-[18px] h-[18px]">
              {Icons.Approve()}
            </div>
          </Button>
        </div>
      </div>
    );
  }

  if (participatingAvailable(tournament)) {
    if (isUserRegistered(tournament, user)) {
      if (isUserRegisteredAndPaymentProceeded(tournament, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div className="mb-10 flex flex-row gap-4 justify-center">
              <Button onClick={() => {}}>Отменить регистрацию</Button>
            </div>
          </div>
        );
      }

      if (isUserCancelledParticipating(tournament, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div>Вы отказались от участия</div>
            <div className="mb-10 flex flex-row gap-4 justify-center">
              <Button onClick={() => {}}>Вернуться к участию</Button>
            </div>
          </div>
        );
      }

      if (userHasRegisteredAndHasNotPaid(tournament, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div>Вы зарегистрированы</div>
            <div className="mb-10 flex flex-row gap-4 justify-center">
              <Button className="bg-[#FF5053] text-white" onClick={() => {}}>
                Не участвую
              </Button>
              <Button onClick={() => {}}>Оплатить</Button>
            </div>
          </div>
        );
      }

      return <></>;
    }

    if (!isUserRegistered(tournament, user)) {
      if (isRankAllowed(tournament, user)) {
        return (
          <div className="mb-10 flex flex-row gap-4 justify-center">
            <Button onClick={() => {}}>Зарегистрироваться</Button>
          </div>
        );
      }

      if (!isRankAllowed(tournament, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div>Ваш ранг не соответствует заявленному для этого турнира</div>
          </div>
        );
      }
      return <></>;
    }
  }

  if (!participatingAvailable(tournament)) {
    if (isRankAllowed(tournament, user)) {
      if (isUserInWaitlist(waitlist, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div>Вы в листе ожидания</div>
            <div className="mb-10 flex flex-row gap-4 justify-center">
              <Button className="bg-[#FF5053] text-white" onClick={() => {}}>
                Покинуть лист ожидания
              </Button>
            </div>
          </div>
        );
      }
      if (!isUserInWaitlist(waitlist, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div>Сейчас мест нет, но вы можете записаться в лист ожидания</div>
            <div className="mb-10 flex flex-row gap-4 justify-center">
              <Button onClick={() => {}}>В лист ожидания</Button>
            </div>
          </div>
        );
      }
      return <></>;
    }

    if (!isRankAllowed(tournament, user)) {
      return (
        <div className="flex flex-col text-center gap-[18px]">
          <div>Ваш ранг не соответствует заявленному для этого турнира</div>
        </div>
      );
    }
    return <></>;
  }

  return <></>;
};
