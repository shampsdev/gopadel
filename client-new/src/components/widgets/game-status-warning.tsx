import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import type { User } from "../../types/user.type";
import type { Waitlist } from "../../types/waitlist.type";
import { RegistrationStatus } from "../../types/registration-status";
import { EventStatus } from "../../types/event-status.type";
import { isRankAllowed } from "../../utils/tournament-status-checks";
import type { Game } from "../../types/game.type";

export const GameStatusWarning = ({
  className,
  game,
  user,
}: {
  className?: string;
  game?: Game;
  user?: User;
  waitlist?: Waitlist;
}) => {
  const userStatus = game?.participants?.find(
    (participant) => participant.userId === user?.id
  )?.status as RegistrationStatus | undefined;

  const rankNotAllowed =
    !isRankAllowed(game, user) &&
    userStatus !== RegistrationStatus.CANCELLED_AFTER_PAYMENT &&
    userStatus !== RegistrationStatus.CONFIRMED;

  if (userStatus || (!userStatus && rankNotAllowed)) {
    return (
      <div
        className={twMerge(
          "bg-[#E25E00] text-[15px] px-[20px] py-[16px] flex flex-row gap-[16px] items-center rounded-[12px] text-white",
          className
        )}
      >
        <div>{Icons.Warning("white", "24", "24")}</div>
        {userStatus === RegistrationStatus.INVITED && (
          <div>Дождитесь обработки вашей заявки организатором</div>
        )}

        {game?.status === EventStatus.full &&
          userStatus !== RegistrationStatus.INVITED &&
          userStatus !== RegistrationStatus.CONFIRMED && (
            <div>
              Сейчас мест нет,&nbsp;но&nbsp;вы можете записаться в&nbsp;лист
              ожидания
            </div>
          )}

        {!userStatus && rankNotAllowed && (
          <div>
            Ваш уровень не&nbsp;соответствует заявленному для&nbsp;этой игры
          </div>
        )}

        {userStatus === RegistrationStatus.CANCELLED && (
          <div>
            Организатор отклонил вашу заявку на&nbsp;участие в&nbsp;игре
          </div>
        )}
        {userStatus === RegistrationStatus.CONFIRMED && (
          <div>Свяжитесь с&nbsp;организатором по&nbsp;вопросу оплаты</div>
        )}
      </div>
    );
  }
};
