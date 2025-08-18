import { Link, useParams } from "react-router";
import { getRankTitle } from "../../utils/rank-title";
import { useGetEvents } from "../../api/hooks/useGetEvents";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { Preloader } from "../../components/widgets/preloader";
import { RegistrationStatus } from "../../types/registration-status";
import { useGetEventWaitlist } from "../../api/hooks/useGetEventWaitlist";
import { Button } from "../../components/ui/button";
import { useRejectGameRegistration } from "../../api/hooks/mutations/registration/reject-game-registration";
import { useApproveGameRegistration } from "../../api/hooks/mutations/registration/approve-game-registration";
import { checkOrganizerRight } from "../../utils/check-organizer-right";
import { useIsAdmin } from "../../api/hooks/useIsAdmin";
import { useAuthStore } from "../../shared/stores/auth.store";

export const GamePlayers = () => {
  useTelegramBackButton({ showOnMount: true });
  const { id } = useParams();

  const { data: events, isLoading } = useGetEvents({ id: id });
  const { data: waitlist, isLoading: waitlistLoading } = useGetEventWaitlist(
    id!
  );
  const { user } = useAuthStore();

  const { mutate: approveRegistration } = useApproveGameRegistration();
  const { mutate: rejectRegistration } = useRejectGameRegistration();

  const { data: isAdmin } = useIsAdmin();

  if (isLoading || waitlistLoading) return <Preloader />;

  if (events) {
    return (
      <div className="flex flex-col gap-9 pb-[100px]">
        <div className="flex flex-col gap-4">
          <p className="text-[24px] font-medium">Участники игры</p>
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
                  participant.status === RegistrationStatus.CONFIRMED
              )
              ?.map((userRegistration) => {
                return (
                  <div
                    key={userRegistration.userId}
                    className="flex flex-col gap-[10px] bg-[#F8F8FA] rounded-[30px] px-[16px] py-[8px]"
                  >
                    <Link to={`/profile/${userRegistration.userId}`}>
                      <div className="flex flex-row items-center gap-[21px] ">
                        <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                          <img
                            className="object-cover w-full h-full"
                            src={userRegistration.user.avatar}
                            alt="avatar"
                          />
                        </div>

                        <div className="flex flex-row gap-[21px] flex-1 flex-grow items-center">
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
                          {userRegistration.status ===
                            RegistrationStatus.LEFT &&
                            !waitlist?.some(
                              (waitlistItem) =>
                                waitlistItem.user.id ===
                                userRegistration.user.id
                            ) && (
                              <div className="w-fit rounded-[30px] px-[10px] py-[6px] bg-[#F34338] bg-opacity-[24%] text-[#F34338] text-[12px] h-full flex flex-col items-start">
                                отменил(а)
                              </div>
                            )}
                          {userRegistration.status ===
                            RegistrationStatus.LEFT &&
                            waitlist &&
                            waitlist.some(
                              (waitlistItem) =>
                                waitlistItem.user.id ===
                                userRegistration.user.id
                            ) && (
                              <div className="w-fit bg-[#F8F8FA] text-[#A4A9B4] h-full flex flex-col rounded-[30px] px-[10px] py-[6px] items-start text-[12px]">
                                в списке ожидания
                              </div>
                            )}
                          {userRegistration.status ===
                            RegistrationStatus.INVITED && (
                            <div className="w-fit bg-[#F8F8FA] text-[#A4A9B4] h-full flex flex-col rounded-[30px] px-[10px] py-[6px] items-start text-[12px]">
                              ожидает подтверждения
                            </div>
                          )}
                          {userRegistration.status ===
                            RegistrationStatus.CONFIRMED && (
                            <div className="w-fit bg-[#E7FFC6] text-[#77BE14] h-full flex flex-col rounded-[30px] px-[10px] py-[6px] items-start text-[12px]">
                              участник
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                    {userRegistration.status === RegistrationStatus.INVITED &&
                      checkOrganizerRight(
                        isAdmin?.admin || false,
                        user?.id || "",
                        events?.[0]
                      ) && (
                        <div className="flex flex-row gap-4 justify-center text-[12px]">
                          <Button
                            className="text-[12px] py-[10px] text-white bg-[#FF5053]"
                            onClick={() => {
                              rejectRegistration({
                                eventId: id!,
                                userId: userRegistration.userId,
                              });
                            }}
                          >
                            Отклонить
                          </Button>
                          <Button
                            onClick={() => {
                              approveRegistration({
                                eventId: id!,
                                userId: userRegistration.userId,
                              });
                            }}
                            className="text-[12px] py-[10px]"
                          >
                            Принять
                          </Button>
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
