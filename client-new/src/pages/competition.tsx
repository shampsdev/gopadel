import { ranks } from "../shared/constants/ranking";
import type { Rank } from "../types/rank.type";

interface CompetitionData {
  rank: Rank;
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

export const Competition = () => {
  const mockData: CompetitionData = {
    rank: ranks[0],
    organizerName: "Организатор",
    date: "2025-01-01",
    locationTitle: "Место",
    address: "Адрес",
    type: "Тип",
    cost: 1000,
    playersCapacity: 10,
    playersAmount: 10,
    participating: false,
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-7 px-[12px]">
        <p className="font-medium text-[24px] text-black">
          {mockData.rank.title}
        </p>

        <div className="flex flex-col">
          <div className="flex flex-row items-center">
            <div className="flex flex-col gap-[2px]">
              <p></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
