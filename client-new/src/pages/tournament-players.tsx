import { useParams } from "react-router";
import { getRankTitle } from "../utils/rank-title";
import { useGetTournaments } from "../api/hooks/useGetTournaments";

export const TournamentPlayers = () => {
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
              <div className="flex flex-row items-center">
                <div>
                  <img src={userRegistration.user.avatar} alt="avatar" />

                  <div className="flex flex-row">
                    <div className="flex flex-col gap-[2px]">
                      <p>
                        {userRegistration.user.firstName}{" "}
                        {userRegistration.user.lastName}
                      </p>
                      <p>{getRankTitle(userRegistration.user.rank)}</p>
                    </div>
                    <div className="w-fit bg-[#E7FFC6]">оплатил</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
};
