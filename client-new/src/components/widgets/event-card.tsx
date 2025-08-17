import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import { getRankTitle } from "../../utils/rank-title";
import { useGetMe } from "../../api/hooks/useGetMe";
import { Preloader } from "./preloader";
import { Link } from "react-router";
import { getLinkToEvent } from "../../utils/get-link-to-event";
import { EventType } from "../../types/event-type.type";
import type { EventStatus } from "../../types/event-status.type";
import { EventStatusView } from "../ui/event-status-view";

export interface EventCardProps {
  className?: string;
  id: string;
  title: string;
  rankMin: number;
  rankMax: number;
  organizerName: string;
  date: string;
  locationTitle: string;
  address: string;
  eventType: EventType;
  type: string;
  cost: number;
  playersCapacity: number;
  playersAmount: number;
  participating?: boolean;
  status: EventStatus;
}

export const EventCard = ({
  id,
  className,
  rankMin,
  rankMax,
  organizerName,
  date,
  locationTitle,
  address,
  eventType,
  type,
  cost,
  playersCapacity,
  playersAmount,
  title,
  participating,
  status,
}: EventCardProps) => {
  const { data: user } = useGetMe();

  if (!user) return <Preloader />;

  return (
    <Link to={getLinkToEvent(id, eventType as EventType)}>
      <div
        className={twMerge(
          "py-5 px-7 flex flex-col gap-5 border-[#EBEDF0] border-[1px] rounded-[24px] bg-white",
          className,
          playersAmount === playersCapacity ? "bg-[#F8F8FA]" : ""
        )}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[12px]">
            <div className="flex flex-row gap-[12px] items-center">
              <EventStatusView status={status} />

              <span className="inline-block w-[6px] h-[6px] rounded-full bg-black"></span>
              <p className="font-medium text-[14px]">{date.split(" ")[0]}</p>

              <span className="inline-block w-[6px] h-[6px] rounded-full bg-black"></span>
              <p className="font-medium text-[14px]">{date.split(" ")[1]}</p>
            </div>

            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-1 flex-1">
                <p className="text-[20px]">{title}</p>
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
          <div className="flex flex-row gap-[6px] ">
            <div className="flex flex-col">
              {cost === 0 && (
                <div className="text-[20px] text-[#77BE14]">бесплатно</div>
              )}
              {cost > 0 && (
                <div
                  className={twMerge(
                    "text-[20px] ",
                    user.loyalty.discount > 0 &&
                      eventType === EventType.tournament
                      ? "text-[#77BE14]"
                      : "text-[#5D6674]"
                  )}
                >
                  <span
                    className={twMerge(
                      "text-black font-semibold text-[20px]",
                      user.loyalty.discount > 0 &&
                        eventType === EventType.tournament &&
                        "text-[#77BE14]"
                    )}
                  >
                    {user.loyalty.discount > 0
                      ? Math.round(cost * (1 - user.loyalty.discount / 100))
                      : cost}
                  </span>{" "}
                  ₽
                </div>
              )}
              <p className="text-[12px] text-[#868D98]">участие</p>
            </div>
            {user.loyalty.discount > 0 &&
              cost > 0 &&
              eventType === EventType.tournament && (
                <div className="text-[14px]  text-[#F34338] line-through">
                  <span className="font-semibold text-[14px] ">{cost}</span>{" "}
                  <span className="opacity-40">₽</span>
                </div>
              )}
          </div>
          <div className="flex flex-row gap-3 items-center">
            <div className="flex flex-row items-center gap-2">
              <div className="w-[18px] h-[18px]">{Icons.People()}</div>
              <p className="text-[16px] font-medium text-[#5D6674]">
                {playersAmount}/{playersCapacity}
              </p>
            </div>

            {playersAmount >= playersCapacity && !participating && (
              <div className="px-[10px] bg-[#F34338] bg-opacity-25 text-[#F34338] text-[14px] py-[6px] rounded-[10px]">
                мест нет
              </div>
            )}
            {participating && (
              <div className="px-[10px] bg-[#E7FFC6]  text-[#77BE14] text-[14px] py-[6px] rounded-[10px]">
                играю
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
