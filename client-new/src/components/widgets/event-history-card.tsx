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
import { EventStatusView } from "../ui/event-status-view";
import { EventStatus } from "../../types/event-status.type";

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
  eventStatus: EventStatus;
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
  eventStatus,
  place,
  eventId,
  eventType,
}: EventHistoryCardProps) => {
  return (
    <Link to={getLinkToEvent(eventId, eventType)}>
      <div
        className={twMerge(
          "py-5 px-7 flex flex-col gap-5 border-[#EBEDF0] border-[1px] rounded-[24px] bg-white",
          className
        )}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[12px]">
            <div className="flex flex-row gap-[12px] items-center">
              <EventStatusView status={eventStatus} />

              <span className="inline-block w-[6px] h-[6px] rounded-full bg-black"></span>
              <p className="font-medium text-[14px]">{date.split(" ")[0]}</p>

              <span className="inline-block w-[6px] h-[6px] rounded-full bg-black"></span>
              <p className="font-medium text-[14px]">{date.split(" ")[1]}</p>
            </div>

            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-1 flex-1">
                <p className="text-[20px]">{name}</p>
                <div className="flex flex-row flex-wrap items-center gap-1 text-[#868D98]">
                  Организатор: <p className="text-[#5D6674]">{organizerName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[4px]">
            <div className="flex flex-row gap-[14px] bg-[#041124] py-[16px] px-[16px] rounded-[16px] text-white text-[14px] items-center">
              <div className="w-[18px] h-[18px]">{Icons.Location("white")}</div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="truncate">{locationTitle}</p>
                <p className="truncate">{address}</p>
              </div>
            </div>
            <div className="flex flex-row gap-[4px] items-center text-[14px]">
              <div className="rounded-[16px] px-[16px] py-[12px] items-center flex flex-row gap-[12px] bg-[#AFFF3F]">
                <div className="w-[18px] h-[18px]">
                  {eventType === EventType.tournament && Icons.Medal("#000000")}
                  {eventType === EventType.game && Icons.Padel("#000000")}
                </div>
                <p>{eventType === EventType.tournament ? "турнир" : "игра"}</p>
              </div>

              <div className="flex-1 flex-shrink-0 rounded-[16px] px-[16px] py-[12px] items-center flex flex-row gap-[12px] bg-[#B4B7FF]">
                <div className="w-[18px] h-[18px]">{Icons.Cup("#000000")}</div>
                <p>{type}</p>
              </div>
            </div>
            <div className="flex flex-row gap-[14px] border-[#EBEDF0] border-[1px] py-[16px] px-[16px] rounded-[16px] text-black text-[14px] items-center">
              <div className="w-[18px] h-[18px]">{Icons.Star("#000000")}</div>
              <div className="flex flex-col flex-1 min-w-0">
                <p>
                  {getRankTitle(rankMin) === getRankTitle(rankMax)
                    ? getRankTitle(rankMin)
                    : `${getRankTitle(rankMin)} - ${getRankTitle(rankMax)}`}
                </p>
              </div>
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
          {status === RegistrationStatus.CONFIRMED &&
            eventStatus !== EventStatus.completed && (
              <p className="text-[#77BE14]">Участие подтверждено</p>
            )}
          {status === RegistrationStatus.CONFIRMED &&
            eventStatus === EventStatus.completed &&
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
            eventStatus === EventStatus.completed &&
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
            eventStatus === EventStatus.completed &&
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
          {status === RegistrationStatus.CONFIRMED &&
            eventStatus === EventStatus.completed &&
            !place && (
              <p className="text-[#868D98] bg-[#F8F8FA] rounded-[10px] px-[10px] py-[6px] text-[14px]">
                участник
              </p>
            )}
        </div>
      </div>
    </Link>
  );
};
