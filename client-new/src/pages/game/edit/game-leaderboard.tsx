import { Link, useParams } from "react-router";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { useGetEvents } from "../../../api/hooks/useGetEvents";
import { Preloader } from "../../../components/widgets/preloader";
import GoldMedal from "../../../assets/gold-medal.png";
import SilverMedal from "../../../assets/silver-medal.png";
import { Button } from "../../../components/ui/button";
import { getRankTitle } from "../../../utils/rank-title";
import BronzeMedal from "../../../assets/bronze-medal.png";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { checkGameOrganizerRight } from "../../../utils/check-organizer-right";
import { EventStatus } from "../../../types/event-status.type";
import type { Tournament } from "../../../types/tournament.type";

export const GameLeaderboard = () => {
  useTelegramBackButton({ showOnMount: true });
  const { id } = useParams();
  const { user } = useAuthStore();

  const { data: events, isLoading } = useGetEvents({ id: id }) as {
    data: Tournament[] | undefined;
    isLoading: boolean;
  };

  if (isLoading) return <Preloader />;

  if (events) {
    return (
      <div className="flex flex-col gap-9 pb-[100px]">
        <div className="flex flex-col gap-4 px-[12px]">
          <p className="text-[24px] font-medium">Результаты игры</p>
          {events[0].status !== EventStatus.completed && (
            <div className="flex flex-col gap-[6px] text-[#5D6674] text-[16px] font-medium">
              <p>Вы пока не добавили результаты прошедшей игры</p>
            </div>
          )}
        </div>

        {events[0].status === EventStatus.completed && (
          <div className="flex flex-col gap-[20px] justify-around">
            {events[0].data?.result?.leaderboard.map((place) => {
              return [
                events[0].participants?.find(
                  (participant) => participant.userId === place.userId
                ),
              ].map((userRegistration) => {
                if (!userRegistration) return null;
                switch (place.place) {
                  case 1:
                    return (
                      <Link
                        key={`place-${place.place}-${place.userId}`}
                        to={`/profile/${place.userId}`}
                      >
                        <div className="flex flex-row items-center gap-[21px] bg-[#FFF8EC] rounded-[30px] pl-[16px] pr-[20px] py-[12px]">
                          <div className="relative">
                            <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                              <img
                                className="object-cover w-full h-full"
                                src={userRegistration?.user.avatar}
                                alt="avatar"
                              />
                            </div>
                            <div className="absolute bottom-[-5px] right-[-4px] w-[24px] h-[24px]">
                              <img
                                src={GoldMedal}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </div>

                          <div className="flex flex-row gap-[21px] flex-1 flex-grow ">
                            <div className="flex flex-row flex-grow flex-1 ">
                              <div className="flex flex-col gap-[2px]">
                                <p className="text-[14px]">
                                  {userRegistration?.user.firstName}{" "}
                                  {userRegistration?.user.lastName}
                                </p>
                                <p className="text-[#868D98] text-[14px]">
                                  {getRankTitle(userRegistration?.user.rank)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#FDB440] rounded-[30px] py-[6px] px-[10px] text-white text-[14px] font-medium">
                            1 место
                          </div>
                        </div>
                      </Link>
                    );
                  case 2:
                    return (
                      <Link
                        key={`place-${place.place}-${place.userId}`}
                        to={`/profile/${place.userId}`}
                      >
                        <div className="flex flex-row items-center gap-[21px] bg-[#F2F7FC] rounded-[30px] pl-[16px] pr-[20px] py-[12px]">
                          <div className="relative">
                            <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                              <img
                                className="object-cover w-full h-full"
                                src={userRegistration?.user.avatar}
                                alt="avatar"
                              />
                            </div>
                            <div className="absolute bottom-[-5px] right-[-4px] w-[24px] h-[24px]">
                              <img
                                src={SilverMedal}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </div>

                          <div className="flex flex-row gap-[21px] flex-1 flex-grow ">
                            <div className="flex flex-row flex-grow flex-1 ">
                              <div className="flex flex-col gap-[2px]">
                                <p className="text-[14px]">
                                  {userRegistration?.user.firstName}{" "}
                                  {userRegistration?.user.lastName}
                                </p>
                                <p className="text-[#868D98] text-[14px]">
                                  {getRankTitle(userRegistration?.user.rank)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#7CADE0] rounded-[30px] py-[6px] px-[10px] text-white text-[14px] font-medium">
                            2 место
                          </div>
                        </div>
                      </Link>
                    );
                  case 3:
                    return (
                      <Link
                        key={`place-${place.place}-${place.userId}`}
                        to={`/profile/${place.userId}`}
                      >
                        <div className="flex flex-row items-center gap-[21px] bg-[#FFF0F1] rounded-[30px] pl-[16px] pr-[20px] py-[12px]">
                          <div className="relative">
                            <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                              <img
                                className="object-cover w-full h-full"
                                src={userRegistration?.user.avatar}
                                alt="avatar"
                              />
                            </div>
                            <div className="absolute bottom-[-5px] right-[-4px] w-[24px] h-[24px]">
                              <img
                                src={BronzeMedal}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </div>

                          <div className="flex flex-row gap-[21px] flex-1 flex-grow ">
                            <div className="flex flex-row flex-grow flex-1 ">
                              <div className="flex flex-col gap-[2px]">
                                <p className="text-[14px]">
                                  {userRegistration?.user.firstName}{" "}
                                  {userRegistration?.user.lastName}
                                </p>
                                <p className="text-[#868D98] text-[14px]">
                                  {getRankTitle(userRegistration?.user.rank)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#FF646F] rounded-[30px] py-[6px] px-[10px] text-white text-[14px] font-medium">
                            3 место
                          </div>
                        </div>
                      </Link>
                    );
                }
              });
            })}

            {events[0].participants &&
              events[0].participants
                ?.filter(
                  (participant) =>
                    !events[0].data?.result?.leaderboard.some(
                      (place) => place.userId === participant.userId
                    )
                )
                ?.map((userRegistration) => {
                  return (
                    <Link
                      key={`place-${userRegistration.userId}`}
                      to={`/profile/${userRegistration.userId}`}
                    >
                      <div
                        className={twMerge(
                          "flex flex-row items-center gap-[21px] bg-white rounded-[30px] pl-[16px] pr-[20px] py-[12px]",
                          userRegistration.userId === user?.id
                            ? "bg-[#F8F8FA]"
                            : "bg-white"
                        )}
                      >
                        <div className="relative">
                          <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                            <img
                              className="object-cover w-full h-full"
                              src={userRegistration?.user.avatar}
                              alt="avatar"
                            />
                          </div>
                          <div className="absolute bottom-[-5px] right-[-4px] w-[24px] h-[24px]">
                            <img
                              src={GoldMedal}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>

                        <div className="flex flex-row gap-[21px] flex-1 flex-grow ">
                          <div className="flex flex-row flex-grow flex-1 ">
                            <div className="flex flex-col gap-[2px]">
                              <p className="text-[14px]">
                                {userRegistration?.user.firstName}{" "}
                                {userRegistration?.user.lastName}
                              </p>
                              <p className="text-[#868D98] text-[14px]">
                                {getRankTitle(userRegistration?.user.rank)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#EBEDF0] rounded-[30px] py-[6px] px-[10px] text-[#868D98] text-[12px] ">
                          участник
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        )}

        {checkGameOrganizerRight(user?.id || "", events?.[0]) && (
          <Link to={`/game/${id}/edit/leaderboard`}>
            <div className="mb-10 fixed bottom-8 z-20 right-0 left-0 flex flex-row gap-4 justify-center">
              <Button>Внести результаты</Button>
            </div>
          </Link>
        )}
      </div>
    );
  }
};
