import { Icons } from "../../assets/icons";
import type { Loyalty } from "../../types/loyalty.type";
import type { PlayingPosition } from "../../types/playing-position.type";

interface PlayerCardProps {
  avatar: string;
  firstName: string;
  lastName: string;
  location: string;
  rank: number;
  position: PlayingPosition;
  bio: string;
  loyalty: Loyalty;
}

export const PlayerCard = ({
  avatar,
  firstName,
  lastName,
  location,
  rank,
  position,
  bio,
  loyalty,
}: PlayerCardProps) => {
  return (
    <div className="px-[10px] py-[16px] border-[#EBEDF0] border-[1px] w-full rounded-[20px] flex flex-col gap-3">
      <div className="flex flex-row items-center relative gap-[10px]">
        <div className="w-[68px] h-[68px] rounded-full relative">
          <img src={avatar} className="object-cover rounded-full" />
          <div className="absolute bottom-[-6px] right-[-5px] p-[6px] rounded-full bg-[#AFFF3F]">
            {loyalty.id === "gold" ? Icons.SharpStar() : <></>}
          </div>
        </div>

        <div className="flex flex-col gap-[5px] text-[#5D6674]">
          <h1 className="text-black text-[16px]">
            {firstName} {lastName}
          </h1>
          <div className="flex flex-row items-center gap-[8px] text-[12px]">
            {Icons.Location(undefined, "14px", "14px")}
            <p>{location}</p>
          </div>
          <div className="flex flex-row items-center gap-[8px] text-[12px]">
            <div className="w-[14px] h-[14px]">
              {Icons.Star(undefined, "14px", "14px")}
            </div>
            <p>{rank}</p>
          </div>

          <div className="flex flex-row items-center gap-[8px] text-[12px]">
            <div className="w-[14px] h-[14px]">
              {Icons.Cage(undefined, "14px", "14px")}
            </div>
            <p>{position}</p>
          </div>
        </div>

        <div className="absolute top-0 right-0">
          {Icons.ArrowRight(undefined, "24px", "24px")}
        </div>
      </div>

      <div className="text-[#5D6674] text-[12px]">
        <p>{bio}</p>
      </div>
    </div>
  );
};
