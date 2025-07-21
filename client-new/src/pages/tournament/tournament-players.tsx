import { Link, useParams } from "react-router";
import { getRankTitle } from "../../utils/rank-title";
import { useGetTournaments } from "../../api/hooks/useGetTournaments";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { Preloader } from "../../components/widgets/preloader";
import { useGetTournamentWaitlist } from "../../api/hooks/useGetTournamentWaitlist";

export const TournamentPlayers = () => {
  useTelegramBackButton({ showOnMount: true });
  const { id } = useParams();

  const { data: tournaments, isLoading } = useGetTournaments({ id: id });
  const { data: waitlist, isLoading: waitlistLoading } =
    useGetTournamentWaitlist(id!);

  if (isLoading || waitlistLoading) return <Preloader />;

  if (tournaments) {
    return (
      <div className="flex flex-col gap-9 pb-[100px]">
        <div className="flex flex-col gap-4">
          <p className="text-[24px] font-medium">Участники турнира</p>
          <div className="flex flex-col gap-[6px] text-[#5D6674] text-[16px] font-medium">
            <p>
              Сейчас зарегистрировано:{" "}
              {
                tournaments?.[0]?.participants.filter(
                  (participant) =>
                    participant.status === "ACTIVE" ||
                    participant.status === "PENDING"
                ).length
              }
            </p>
            <p>Максимум: {tournaments[0].maxUsers}</p>
          </div>
        </div>

        <div className="flex flex-col gap-[20px] justify-around">
          {tournaments[0].participants
            .filter(
              (participant) =>
                participant.status === "ACTIVE" ||
                participant.status === "CANCELED_BY_USER" ||
                participant.status === "PENDING"
            )
            .map((userRegistration) => {
              return (
                <Link
                  key={userRegistration.id}
                  to={`/profile/${userRegistration.user.id}`}
                >
                  <div className="flex flex-row items-center gap-[21px]">
                    <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                      <img
                        className="object-cover w-full h-full"
                        src={userRegistration.user.avatar}
                        alt="avatar"
                      />
                    </div>

                    <div className="flex flex-row gap-[21px] flex-1 flex-grow ">
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
                      {userRegistration.status === "CANCELED_BY_USER" &&
                        !waitlist?.some(
                          (waitlistItem) =>
                            waitlistItem.user.id === userRegistration.user.id
                        ) && (
                          <div className="w-fit rounded-[30px] px-[10px] py-[6px] bg-[#F34338] bg-opacity-[24%] text-[#F34338] text-[12px] h-full flex flex-col items-start">
                            отменил(а)
                          </div>
                        )}
                      {userRegistration.status === "CANCELED_BY_USER" &&
                        waitlist &&
                        waitlist.some(
                          (waitlistItem) =>
                            waitlistItem.user.id === userRegistration.user.id
                        ) && (
                          <div className="w-fit bg-[#F8F8FA] text-[#A4A9B4] h-full flex flex-col rounded-[30px] px-[10px] py-[6px] items-start text-[12px]">
                            в списке ожидания
                          </div>
                        )}
                      {userRegistration.status === "PENDING" && (
                        <div className="w-fit bg-[#F8F8FA] text-[#A4A9B4] h-full flex flex-col rounded-[30px] px-[10px] py-[6px] items-start text-[12px]">
                          ожидает оплаты
                        </div>
                      )}
                      {userRegistration.status === "ACTIVE" && (
                        <div className="w-fit bg-[#E7FFC6] text-[#77BE14] h-full flex flex-col rounded-[30px] px-[10px] py-[6px] items-start text-[12px]">
                          оплатил(a)
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    );
  }
};
