import { Link, useParams } from "react-router";
import { getRankTitle } from "../../utils/rank-title";
import { useGetEvents } from "../../api/hooks/useGetEvents";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { Preloader } from "../../components/widgets/preloader";
import { RegistrationStatus } from "../../types/registration-status";
import { useGetEventWaitlist } from "../../api/hooks/useGetEventWaitlist";

export const TournamentPlayers = () => {
  useTelegramBackButton({ showOnMount: true });
  const { id } = useParams();

  const { data: events, isLoading } = useGetEvents({ id: id });
  const { data: waitlist, isLoading: waitlistLoading } = useGetEventWaitlist(
    id!
  );

  if (isLoading || waitlistLoading) return <Preloader />;

  if (events) {
    return (
      <div className="flex flex-col gap-9 pb-[100px]">
        <div className="flex flex-col gap-4">
          <p className="text-[24px] font-medium">Участники турнира</p>
          <div className="flex flex-col gap-[6px] text-[#5D6674] text-[16px] font-medium">
            <p>
              Сейчас зарегистрировано:{" "}
              {
                events[0].participants?.filter(
                  (participant) =>
                    participant.status === RegistrationStatus.CONFIRMED ||
                    participant.status === RegistrationStatus.PENDING
                ).length
              }
            </p>
            <p>Максимум: {events[0].maxUsers}</p>
          </div>
        </div>

        <div className="flex flex-col gap-[20px] justify-around">
          {events[0].participants &&
            events[0].participants
              ?.filter(
                (participant) =>
                  participant.status === RegistrationStatus.CONFIRMED ||
                  participant.status === RegistrationStatus.LEFT ||
                  participant.status === RegistrationStatus.PENDING
              )
              ?.map((userRegistration) => {
                return (
                  <Link
                    key={userRegistration.userId}
                    to={`/profile/${userRegistration.userId}`}
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
                        {userRegistration.status === RegistrationStatus.LEFT &&
                          !waitlist?.some(
                            (waitlistItem) =>
                              waitlistItem.user.id === userRegistration.user.id
                          ) && (
                            <div className="w-fit rounded-[30px] px-[10px] py-[6px] bg-[#F34338] bg-opacity-[24%] text-[#F34338] text-[12px] h-full flex flex-col items-start">
                              отменил(а)
                            </div>
                          )}
                        {userRegistration.status === RegistrationStatus.LEFT &&
                          waitlist &&
                          waitlist.some(
                            (waitlistItem) =>
                              waitlistItem.user.id === userRegistration.user.id
                          ) && (
                            <div className="w-fit bg-[#F8F8FA] text-[#A4A9B4] h-full flex flex-col rounded-[30px] px-[10px] py-[6px] items-start text-[12px]">
                              в списке ожидания
                            </div>
                          )}
                        {userRegistration.status ===
                          RegistrationStatus.PENDING && (
                          <div className="w-fit bg-[#F8F8FA] text-[#A4A9B4] h-full flex flex-col rounded-[30px] px-[10px] py-[6px] items-start text-[12px]">
                            ожидает оплаты
                          </div>
                        )}
                        {userRegistration.status ===
                          RegistrationStatus.CONFIRMED && (
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
