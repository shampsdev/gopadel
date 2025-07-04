import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import { getRankTitle } from "../../utils/rank-title";
import { useGetMe } from "../../api/hooks/useGetMe";
import { Preloader } from "./preloader";

export interface CompetitionCardProps {
  className?: string;
  title: string;
  rank: number;
  organizerName: string;
  date: string;
  locationTitle: string;
  address: string;
  type: string;
  cost: number;
  playersCapacity: number;
  playersAmount: number;
  participating?: boolean;
}

export const CompetitionCard = ({
  className,
  rank,
  organizerName,
  date,
  locationTitle,
  address,
  type,
  cost,
  playersCapacity,
  playersAmount,
  title,
  participating,
}: CompetitionCardProps) => {
  const { data: user } = useGetMe();

  if (!user) return <Preloader />;

  return (
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
              {Icons.Medal("#77BE14")}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-[#868D98]">
          <div className="flex flex-row items-center gap-3">
            {Icons.Calendar()}
            <p>{date}</p>
          </div>

          <div className="flex flex-row items-center gap-3">
            {Icons.Location()}
            <div className="flex flex-col ">
              <p>{locationTitle}</p>
              <p>{address}</p>
            </div>
          </div>

          <div className="flex flex-row items-center gap-3">
            {Icons.Cup()}
            <p>Тип: {type}</p>
          </div>

          <div className="flex flex-row items-center gap-3">
            {Icons.Star()}
            <p>{getRankTitle(rank)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-[6px] ">
          <div className="flex flex-col">
            <div
              className={twMerge(
                "text-[20px] ",
                user.loyalty.discount > 0 ? "text-[#77BE14]" : "text-[#5D6674]"
              )}
            >
              <span
                className={twMerge(
                  "text-black font-semibold text-[20px]",
                  user.loyalty.discount > 0 && "text-[#77BE14]"
                )}
              >
                {user.loyalty.discount > 0
                  ? Math.round(cost * (1 - user.loyalty.discount))
                  : cost}
              </span>{" "}
              ₽
            </div>
            <p className="text-[12px] text-[#868D98]">участие</p>
          </div>
          {user.loyalty.discount > 0 && (
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
  );
};
