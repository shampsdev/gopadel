import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import { getRankTitle } from "../../utils/rank-title";
import type { RegistrationStatus } from "../../types/registration-status";

export interface CompetitionHistoryCardProps {
  className?: string;
  rank: number;
  organizerName: string;
  date: string;
  locationTitle: string;
  address: string;
  type: string;
  playersCapacity: number;
  playersAmount: number;
  status: RegistrationStatus;
}

export const CompetitionHistoryCard = ({
  className,
  rank,
  organizerName,
  date,
  locationTitle,
  address,
  type,
  status,
}: CompetitionHistoryCardProps) => {
  return (
    <div
      className={twMerge(
        "py-5 px-7 flex flex-col gap-9 border-[#EBEDF0] border-[1px] rounded-[24px] bg-white",
        className
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-[20px]">{getRankTitle(rank ?? 0)}</p>
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
        <p className="text-[16px] text-[#868D98]">статус</p>
        {status === "CANCELED_BY_USER" && (
          <p className="text-[#F34338]">Вы отменили участие</p>
        )}
        {status === "CANCELED" && (
          <p className="text-[#F34338]">Участие отменено</p>
        )}
        {status === "PENDING" && <p>Ожидает подтверждения</p>}
        {status === "ACTIVE" && (
          <p className="text-[#AFFF3F]">Участие подтверждено</p>
        )}
      </div>
    </div>
  );
};
