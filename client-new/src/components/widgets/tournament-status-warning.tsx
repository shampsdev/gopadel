import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import type { Tournament } from "../../types/tournament.type";
import type { User } from "../../types/user.type";
import type { Waitlist } from "../../types/waitlist.type";

export const TournamentStatusWarning = ({
  className,
  tournament,
  user,
  waitlist,
}: {
  className?: string;
  tournament?: Tournament;
  user?: User;
  waitlist?: Waitlist;
}) => {
  return (
    <div
      className={twMerge(
        "bg-[#E25E00] px-[20px] py-[16px] flex flex-row gap-[16px] items-center rounded-[12px] text-white",
        className
      )}
    >
      <div>{Icons.Warning("white", "24", "24")}</div>
      <p>message {tournament?.status || "message"}</p>
    </div>
  );
};
