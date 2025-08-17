import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import type { Tournament } from "../../types/tournament.type";
import type { User } from "../../types/user.type";
import type { Waitlist } from "../../types/waitlist.type";
import { RegistrationStatus } from "../../types/registration-status";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { EventStatus } from "../../types/event-status.type";
import { isRankAllowed } from "../../utils/tournament-status-checks";

export const TournamentStatusWarning = ({
  className,
  tournament,
  user,
}: {
  className?: string;
  tournament?: Tournament;
  user?: User;
  waitlist?: Waitlist;
}) => {
  const userStatus = tournament?.participants?.find(
    (participant) => participant.userId === user?.id
  )?.status as RegistrationStatus | undefined;

  const rankNotAllowed =
    !isRankAllowed(tournament, user) &&
    userStatus !== RegistrationStatus.CANCELLED_AFTER_PAYMENT &&
    userStatus !== RegistrationStatus.CONFIRMED;

  const warningEnabled =
    userStatus === RegistrationStatus.CANCELLED_AFTER_PAYMENT ||
    (userStatus !== RegistrationStatus.CONFIRMED &&
      tournament?.status === EventStatus.full) ||
    rankNotAllowed ||
    userStatus === RegistrationStatus.PENDING;

  if (warningEnabled) {
    return (
      <div
        className={twMerge(
          "bg-[#E25E00] text-[15px] px-[20px] py-[16px] flex flex-row gap-[16px] items-center rounded-[12px] text-white",
          className
        )}
      >
        <div>{Icons.Warning("white", "24", "24")}</div>
        {userStatus === RegistrationStatus.CANCELLED_AFTER_PAYMENT && (
          <div>
            Для&nbsp;возврата средств
            <br /> обращайтесь к&nbsp;
            <span
              onClick={() => openTelegramLink("https://t.me/Alievskey")}
              className="px-[8px] py-[2px] bg-white text-[#E25E00] rounded-[12px]"
            >
              @Alievskey
            </span>
          </div>
        )}

        {tournament?.status === EventStatus.full && (
          <div>
            Сейчас мест нет,&nbsp;но&nbsp;вы можете записаться в&nbsp;лист
            ожидания
          </div>
        )}

        {!isRankAllowed(tournament, user) &&
          userStatus !== RegistrationStatus.CANCELLED_AFTER_PAYMENT && (
            <div>
              Ваш уровень не&nbsp;соответствует заявленному для&nbsp;этого
              турнира
            </div>
          )}

        {userStatus === RegistrationStatus.PENDING && (
          <div>Для&nbsp;подтверждения регистрации оплатите участие</div>
        )}
      </div>
    );
  }
};
