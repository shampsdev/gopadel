import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import { getRankTitle } from "../../utils/rank-title";
import { RegistrationStatus } from "../../types/registration-status";
import type { Prize } from "../../types/prize.type";
import GoldMedal from "../../assets/gold-medal.png";
import SilverMedal from "../../assets/silver-medal.png";
import BronzeMedal from "../../assets/bronze-medal.png";
import { Link } from "react-router";
import { getLinkToEvent } from "../../utils/get-link-to-event";
import { EventType } from "../../types/event-type.type";

export interface EventHistoryCardProps {
  className?: string;
  eventId: string;
  eventType: EventType;
  rankMin: number;
  rankMax: number;
  organizerName: string;
  date: string;
  locationTitle: string;
  address: string;
  type: string;
  name: string;
  status: RegistrationStatus;
  isFinished: boolean;
  place: Prize | null;
}

export const EventHistoryCard = ({
  className,
  rankMin,
  rankMax,
  organizerName,
  date,
  locationTitle,
  address,
  type,
  name,
  status,
  isFinished,
  place,
  eventId,
  eventType,
}: EventHistoryCardProps) => {
  return (
    <Link to={getLinkToEvent(eventId, eventType)}>
      <div
        className={twMerge(
          "py-5 px-7 flex flex-col gap-9 border-[#EBEDF0] border-[1px] rounded-[24px] bg-white",
          className
        )}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-[20px]">{name}</p>
              <div className="flex flex-row flex-wrap items-center gap-1 text-[#868D98]">
                Организатор: <p className="text-[#5D6674]">{organizerName}</p>
              </div>
            </div>

            <div>
              <div className="bg-[#E7FFC6] rounded-full p-[10px]">
                {eventType === EventType.tournament && Icons.Medal("#77BE14")}

                {eventType === EventType.game && Icons.Padel("#77BE14")}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-[#868D98]">
            <div className="flex flex-row items-start gap-3 ">
              <div className="flex-shrink-0 w-[18px] h-[18px] pt-[4px] flex items-center justify-center">
                {Icons.Calendar()}
              </div>
              <p>{date}</p>
            </div>

            <div className="flex flex-row items-start gap-3">
              <div className="flex-shrink-0 w-[18px] h-[18px] pt-[4px] flex items-center justify-center">
                {Icons.Location()}
              </div>
              <div className="flex flex-col justify-start">
                <p>{locationTitle}</p>
                <p>{address}</p>
              </div>
            </div>

            <div className="flex flex-row items-start gap-3 ">
              <div className="flex-shrink-0 w-[18px] h-[18px] pt-[4px] flex items-center justify-center">
                {Icons.Cup()}
              </div>
              <p>Тип: {type}</p>
            </div>

            <div className="flex flex-row items-start gap-3">
              <div className="flex-shrink-0 w-[18px] h-[18px] pt-[4px] flex items-center justify-center">
                {Icons.Star()}
              </div>
              <p>
                {getRankTitle(rankMin) === getRankTitle(rankMax)
                  ? getRankTitle(rankMin)
                  : `${getRankTitle(rankMin)} - ${getRankTitle(rankMax)}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center">
          <p className="text-[16px] text-[#868D98]">статус</p>
          {status === RegistrationStatus.LEFT && (
            <p className="text-[#F34338]">Вы отменили участие</p>
          )}
          {status === RegistrationStatus.CANCELLED && (
            <p className="text-[#F34338]">Участие отменено</p>
          )}
          {(status === RegistrationStatus.PENDING ||
            status === RegistrationStatus.INVITED) && (
            <p>Ожидает подтверждения</p>
          )}
          {status === RegistrationStatus.CONFIRMED && !isFinished && (
            <p className="text-[#77BE14]">Участие подтверждено</p>
          )}
          {status === RegistrationStatus.CONFIRMED &&
            isFinished &&
            place === 1 && (
              <div className="flex flex-row items-center gap-[12px]">
                <div className="flex flex-row items-center gap-[6px]">
                  <div className="w-[24px] h-[24px]">
                    <img src={GoldMedal} alt="gold medal" />
                  </div>
                </div>
                <p className="text-[#FDB440] bg-[#FFF8EC] text-[14px] rounded-[10px] px-[10px] py-[6px]">
                  Победитель
                </p>
              </div>
            )}
          {status === RegistrationStatus.CONFIRMED &&
            isFinished &&
            place === 2 && (
              <div className="flex flex-row items-center gap-[12px]">
                <div className="flex flex-row items-center gap-[6px]">
                  <div className="w-[24px] h-[24px]">
                    <img src={SilverMedal} alt="silver medal" />
                  </div>
                </div>
                <p className="text-[#7CADE0] bg-[#F2F7FC] text-[14px] rounded-[10px] px-[10px] py-[6px]">
                  Призёр
                </p>
              </div>
            )}
          {status === RegistrationStatus.CONFIRMED &&
            isFinished &&
            place === 3 && (
              <div className="flex flex-row items-center gap-[12px]">
                <div className="flex flex-row items-center gap-[6px]">
                  <div className="w-[24px] h-[24px]">
                    <img src={BronzeMedal} alt="bronze medal" />
                  </div>
                </div>
                <p className="text-[#7CADE0] bg-[#F2F7FC] text-[14px] rounded-[10px] px-[10px] py-[6px]">
                  Призёр
                </p>
              </div>
            )}
          {status === RegistrationStatus.CONFIRMED && isFinished && !place && (
            <p className="text-[#868D98] bg-[#F8F8FA] rounded-[10px] px-[10px] py-[6px] text-[14px]">
              участник
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};
