import { useParams } from "react-router";
import { getRankTitle } from "../utils/rank-title";
import { useGetTournaments } from "../api/hooks/useGetTournaments";
import { useTelegramBackButton } from "../shared/hooks/useTelegramBackButton";

export const TournamentPlayers = () => {
  useTelegramBackButton({ showOnMount: true });
  const { id } = useParams();

  const { data: tournaments, isLoading } = useGetTournaments({ id: id });

  if (isLoading) return null;

  if (tournaments) {
    return (
      <div className="flex flex-col gap-9">
        <div className="flex flex-col gap-4">
          <p>Участники турнира</p>
          <div className="flex flex-col gap-[6px]">
            <p>Сейчас зарегистрировано: {tournaments[0].participants.length}</p>
            <p>Максимум: {tournaments[0].maxUsers}</p>
          </div>
        </div>

        <div className="flex flex-col gap-[20px] justify-around">
          {tournaments[0].participants.map((userRegistration) => {
            return (
              <div
                key={userRegistration.id}
                className="flex flex-row  gap-[21px]"
              >
                <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                  <img
                    className="object-cover w-full h-full"
                    src={userRegistration.user.avatar}
                    alt="avatar"
                  />
                </div>

                <div className="flex flex-row flex-grow flex-1 ">
                  <div className="flex flex-col gap-[2px]">
                    <p className="text-[14px]">
                      {userRegistration.user.firstName}{" "}
                      {userRegistration.user.lastName}
                    </p>
                    <p className="text-[#868D98] text-[14px]">
                      {getRankTitle(userRegistration.user.rank)}
                    </p>
                  </div>
                </div>

                {userRegistration.status === "PENDING" && (
                  <div className="w-fit bg-[#E7FFC6] h-full flex flex-col items-start">
                    оплатил(a)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
};
