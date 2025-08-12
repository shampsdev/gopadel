import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import { getRankTitle } from "../../utils/rank-title";
import { useGetMe } from "../../api/hooks/useGetMe";
import { Preloader } from "./preloader";
import { Link } from "react-router";
import { getLinkToEvent } from "../../utils/get-link-to-event";
import { EventType } from "../../types/event-type.type";

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
}: EventCardProps) => {
  const { data: user } = useGetMe();

  if (!user) return <Preloader />;

  return (
    <Link to={getLinkToEvent(id, eventType as EventType)}>
      <div
        className={twMerge(
          "py-5 px-7 flex flex-col gap-9 border-[#EBEDF0] border-[1px] rounded-[24px] bg-white",
          className,
          playersAmount === playersCapacity ? "bg-[#F8F8FA]" : ""
        )}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-[20px]">{title}</p>
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
            <div className="flex flex-row items-start gap-3">
              <div className="flex-shrink-0 w-[18px] h-[18px] pt-[4px] flex items-center justify-center">
                {Icons.Calendar()}
              </div>
              <p>{date}</p>
            </div>

            <div className="flex flex-row items-start gap-3">
              <div className="flex-shrink-0 w-[18px] h-[18px] pt-[4px] flex items-center justify-center">
                {Icons.Location()}
              </div>
              <div className="flex flex-col ">
                <p>{locationTitle}</p>
                <p>{address}</p>
              </div>
            </div>

            <div className="flex flex-row items-start gap-3">
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
                {" "}
                {getRankTitle(rankMin) === getRankTitle(rankMax)
                  ? getRankTitle(rankMin)
                  : `${getRankTitle(rankMin)} - ${getRankTitle(rankMax)}`}
              </p>
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
