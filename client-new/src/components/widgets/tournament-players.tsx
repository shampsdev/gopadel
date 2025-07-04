import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { Registration } from "../../types/registration.type";
import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import { useAuthStore } from "../../shared/stores/auth.store";
import { openTelegramLink } from "@telegram-apps/sdk-react";

interface TurnamentPlayers {
  tournamentId: string;
  registrations?: Registration[];
  showAll?: boolean;
  maxDisplay?: number;
}

export const TournamentPlayers = ({
  registrations,
  tournamentId,
}: TurnamentPlayers) => {
  const { user } = useAuthStore();
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const goToUserProfile = (userId: string, event: React.MouseEvent) => {
    navigate(`/profile/${userId}`);
  };

  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      setShowLeftShadow(scrollLeft > 5);
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 5);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);

      checkScroll();

      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [registrations]);

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide px-4"
      >
        <div className="flex space-x-4 min-w-max py-2 scroll-smooth">
          <div
            onClick={() => {
              openTelegramLink(
                `https://t.me/share/url?url=https://t.me/study_stats_bot/aboba?startapp=${tournamentId}`
              );
            }}
            className="flex flex-col items-center cursor-pointer relative"
          >
            <div
              className={twMerge(
                "w-16 h-16 relative rounded-full overflow-hidden mb-1 bg-[#AFFF3F]  flex-shrink-0 flex flex-col items-center justify-center"
              )}
            >
              {Icons.Cross("black")}
            </div>
            <div
              className={twMerge(
                "text-center text-[12px] font-normal text-black  "
              )}
            >
              <div>Пригласить</div>
              <div>участника</div>
            </div>
          </div>
          {registrations &&
            registrations.map((registration, index) => {
              const fullName = `${registration.user.firstName} ${registration.user.lastName}`;
              return (
                <div
                  key={`${registration.user?.id}-${index}`}
                  className={twMerge(
                    "flex flex-col items-center cursor-pointer relative",
                    registration.status === "PENDING" && "opacity-50",
                    registration.status === "CANCELED_BY_USER" && "opacity-75"
                  )}
                  onClick={(e) => goToUserProfile(registration.user.id, e)}
                >
                  {registration.status === "ACTIVE" && (
                    <div className="absolute bg-[#AFFF3F] top-0 right-0 w-[24px] z-10 h-[24px] rounded-full flex items-center justify-center">
                      {Icons.Success("black")}
                    </div>
                  )}
                  {registration.status === "CANCELED_BY_USER" && (
                    <div className="absolute bg-[#F34338] top-0 right-0 w-[24px] z-10 h-[24px] rounded-full flex items-center justify-center">
                      {Icons.Success("black")}
                    </div>
                  )}
                  <div
                    className={twMerge(
                      "w-16 h-16 relative rounded-full overflow-hidden mb-1 bg-gray-200 flex-shrink-0"
                    )}
                  >
                    {registration.user?.avatar ? (
                      <img
                        src={registration.user.avatar}
                        alt={fullName}
                        className={twMerge("w-full h-full object-cover")}
                      />
                    ) : (
                      <div
                        className={twMerge(
                          "w-full h-full flex items-center justify-center"
                        )}
                      >
                        {registration.user.firstName.charAt(0)}
                        {registration.user.lastName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div
                    className={twMerge("text-center text-[12px] text-black ")}
                  >
                    {registration.user.id === user?.id ? (
                      <div>Вы</div>
                    ) : (
                      <>
                        <div>{registration.user.firstName}</div>
                        <div>{registration.user.lastName}</div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {showLeftShadow && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
      )}

      {showRightShadow && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />
      )}
    </div>
  );
};
