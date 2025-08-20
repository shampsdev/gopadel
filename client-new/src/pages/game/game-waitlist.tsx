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
import {
  checkGameOrganizerRight,
  checkOrganizerRight,
} from "../../utils/check-organizer-right";
import { useIsAdmin } from "../../api/hooks/useIsAdmin";
import { useAuthStore } from "../../shared/stores/auth.store";
import { Icons } from "../../assets/icons";

export const GameWaitlist = () => {
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
          <p className="text-[24px] font-medium">Список ожидания</p>
        </div>

        <div className="flex flex-col gap-[20px] justify-around">
          {events[0].participants &&
            events[0].participants
              ?.filter(
                (participant) =>
                  participant.status === RegistrationStatus.INVITED
              )
              ?.map((userRegistration) => {
                return (
                  <div
                    key={userRegistration.userId}
                    className="flex flex-row  bg-[#F8F8FA] rounded-[30px] px-[16px] py-[8px] items-center"
                  >
                    <Link
                      to={`/profile/${userRegistration.userId}`}
                      className="flex-1"
                    >
                      <div className="flex flex-row items-center gap-[21px] flex-1">
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
                        </div>
                      </div>
                    </Link>
                    <div className="flex flex-row justify-between gap-[4px] items-center">
                      {checkGameOrganizerRight(user?.id || "", events?.[0]) && (
                        <div
                          className="rounded-full w-[42px] h-[42px] flex flex-row items-center justify-center bg-[#AFFF3F]"
                          onClick={() => {
                            approveRegistration({
                              eventId: id!,
                              userId: userRegistration.userId,
                            });
                          }}
                        >
                          {Icons.Accept()}
                        </div>
                      )}
                      {checkGameOrganizerRight(user?.id || "", events?.[0]) && (
                        <div
                          className="rounded-full w-[42px] h-[42px] flex flex-row items-center justify-center"
                          style={{ backgroundColor: "rgba(243, 67, 56, 0.24)" }}
                          onClick={() => {
                            rejectRegistration({
                              eventId: id!,
                              userId: userRegistration.userId,
                            });
                          }}
                        >
                          {Icons.Reject()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    );
  }
};
