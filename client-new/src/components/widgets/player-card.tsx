import { Icons } from "../../assets/icons";
import type { PlayingPosition } from "../../types/playing-position.type";
import { getRankTitle } from "../../utils/rank-title";

import NoLoyalty from "../../assets/loyalty/no_loyalty.svg";
import PadelActive from "../../assets/loyalty/gopadel_active.svg";
import PadelFriend from "../../assets/loyalty/friend.svg";
import Aksakal from "../../assets/loyalty/aksakal.svg";
import Ambassador from "../../assets/loyalty/ambassador.svg";
import Partner from "../../assets/loyalty/partner.svg";
import Maekenas from "../../assets/loyalty/maekenas.svg";

interface PlayerCardProps {
  loyaltyId: number;
  avatar: string;
  firstName: string;
  lastName: string;
  location: string;
  rank: number;
  position: PlayingPosition;
  bio: string;
}

export const PlayerCard = ({
  loyaltyId,
  avatar,
  firstName,
  lastName,
  location,
  rank,
  position,
  bio,
}: PlayerCardProps) => {
  return (
    <div className="px-[10px] py-[16px] border-[#EBEDF0] border-[1px] w-full rounded-[20px] flex flex-col gap-3">
      <div className="flex flex-row items-center relative gap-[10px]">
        <div className="w-[68px] h-[68px] relative rounded-full">
          {avatar.length > 0 && (
            <div className="">
              <img
                src={avatar}
                className="object-cover w-full h-full rounded-full aspect-square"
              />

              {loyaltyId === 1 && (
                <img
                  className="absolute bottom-0 right-0 w-[26px] h-[26px] rounded-full p-[4px] bg-[#041124]"
                  src={NoLoyalty}
                />
              )}
              {loyaltyId === 2 && (
                <img
                  className="absolute bottom-0 right-0 w-[26px] h-[26px] rounded-full p-[4px] bg-[#041124]"
                  src={PadelActive}
                />
              )}
              {loyaltyId === 3 && (
                <img
                  className="absolute bottom-0 right-0 w-[26px] h-[26px] rounded-full p-[4px] bg-[#041124]"
                  src={PadelFriend}
                />
              )}
              {loyaltyId === 4 && (
                <img
                  className="absolute bottom-0 right-0 w-[26px] h-[26px] rounded-full p-[4px] bg-[#041124]"
                  src={Aksakal}
                />
              )}
              {loyaltyId === 5 && (
                <img
                  className="absolute bottom-0 right-0 w-[26px] h-[26px] rounded-full p-[4px] bg-[#041124]"
                  src={Ambassador}
                />
              )}
              {loyaltyId === 8 && (
                <img
                  className="absolute bottom-0 right-0 w-[26px] h-[26px] rounded-full p-[4px] bg-[#041124]"
                  src={Partner}
                />
              )}
              {loyaltyId === 7 && (
                <img
                  className="absolute bottom-0 right-0 w-[26px] h-[26px] rounded-full p-[4px] bg-[#041124]"
                  src={Maekenas}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[5px] text-[#5D6674] px-[12px]">
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
            <p>{getRankTitle(rank)}</p>
          </div>

          <div className="flex flex-row items-center gap-[8px] text-[12px]">
            <div className="w-[14px] h-[14px]">
              {Icons.Cage(undefined, "14px", "14px")}
            </div>
            <p>
              {position === "left" && "Левый"}
              {position === "right" && "Правый"}
              {position === "both" && "В обоих"}
            </p>
          </div>
        </div>

        <div className="absolute top-0 right-0">
          {Icons.ArrowRight(undefined, "24px", "24px")}
        </div>
      </div>

      <div className="text-[#5D6674] text-[12px] px-[12px]">
        <p>{bio}</p>
      </div>
    </div>
  );
};
