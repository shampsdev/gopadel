import { useParams } from "react-router";
import { Icons } from "../assets/icons";
import { getRankTitle } from "../utils/rank-title";
import { useTelegramBackButton } from "../shared/hooks/useTelegramBackButton";
import { useGetTournaments } from "../api/hooks/useGetTournaments";
import { useEffect } from "react";
import { useGetTournamentWaitlist } from "../api/hooks/useGetTournamentWaitlist";
import { TournamentPlayers } from "../components/widgets/tournament-players";

export const Tournament = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { id } = useParams();

  const { data: tournament, isLoading } = useGetTournaments({ id: id! });
  const { data: waitlist, isLoading: waitlistLoading } =
    useGetTournamentWaitlist(id!);

  const getPersonWord = (count: number) => {
    if (count === 1) return "человек";
    if (count >= 2 && count <= 4) return "человека";
    return "человек";
  };
  useEffect(() => {
    console.log(tournament?.[0]);
  }, [tournament]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-8 pb-[100px]">
      <div className="flex flex-col gap-7 px-[12px]">
        <h1 className="text-[24px] font-medium">{tournament?.[0]?.name}</h1>

        <div className="flex flex-col">
          <div className="py-5 border-b border-[#DADCE0]">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col gap-[2px]">
                <p className="text-[14px] text-[#5D6674]">
                  {tournament?.[0].startTime &&
                    new Date(tournament[0].startTime).toLocaleDateString(
                      "ru-RU",
                      {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Moscow",
                      }
                    )}
                </p>
                <p className="text-[14px] text-[#5D6674]">
                  {tournament?.[0].endTime &&
                    new Date(tournament[0].endTime).toLocaleDateString(
                      "ru-RU",
                      {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Moscow",
                      }
                    )}
                </p>
              </div>

              <div className="flex flex-col">
                <p className="text-[14px] text-[#5D6674]">
                  {tournament?.[0].price} ₽
                </p>
                <p>участие</p>
              </div>
            </div>
          </div>

          <div className="py-5 border-b border-[#DADCE0]">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col gap-[2px]">
                <p className="text-[16px] ">{tournament?.[0].club.name}</p>
                <p className="text-[14px] text-[#868D98]">
                  {tournament?.[0].club.address}
                </p>
              </div>

              <div className="w-[42px] h-[42px] bg-[#F8F8FA] rounded-full flex flex-col justify-center items-center">
                {Icons.Location("black")}
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col gap-[2px]">
                <div className="text-[16px] gap-1 text-[#868D98] flex flex-row items-center">
                  <p>Тип:</p>
                  <p className="text-black">
                    {tournament?.[0].tournamentType.toLowerCase()}
                  </p>
                </div>
                <div className="text-[16px] text-[#868D98] gap-1 flex flex-row items-center">
                  <p>Ранг:</p>
                  <p className="text-black">
                    {getRankTitle(tournament?.[0].rankMin || 0)}
                  </p>
                </div>
              </div>

              <div className="w-[42px] h-[42px] bg-[#F8F8FA] rounded-full flex flex-col justify-center items-center">
                {Icons.Star("black")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-row justify-between items-center px-[12px]">
          <div className="flex flex-row gap-[7px] items-center">
            <p>Участники</p>

            {tournament &&
              tournament?.[0].participants.length <
                tournament?.[0].maxUsers && (
                <p className="text-[14px] text-[#000000]">
                  {tournament?.[0].participants.length} /{" "}
                  {tournament?.[0].maxUsers}
                </p>
              )}

            {tournament &&
              tournament?.[0].participants.length >=
                tournament?.[0].maxUsers && (
                <p className="text-[14px] text-[#F34338]">
                  {tournament?.[0].participants.length} /{" "}
                  {tournament?.[0].maxUsers}
                </p>
              )}
          </div>

          <div className="bg-[#F8F8FA] rounded-[20px] py-[6px] px-[14px] text-[12px] text-[#5D6674]">
            смотреть все
          </div>
        </div>

        <TournamentPlayers
          tournamentId={id!}
          registrations={
            tournament?.[0].participants
              ? Array(10).fill(tournament[0].participants).flat()
              : []
          }
        />

        <div className="flex flex-row items-center flex-1">
          <div>Иконка</div>
          <div className="flex flex-col gap-[2px]">
            <p>Список ожидания</p>
            <p>
              {waitlist?.length} {getPersonWord(waitlist?.length || 0)}
            </p>
          </div>
        </div>

        <div>{Icons.ArrowRight()}</div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-row justify-between">
          <p>Организатор: {}</p>

          <div className="flex flex-row items-center gap-[10px]">
            <p>Написать</p>
            <div>{Icons.Ball()}</div>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between">
          <p>Поделиться турниром</p>
          <div>{Icons.Ball()}</div>
        </div>
      </div>

      <div className="flex justify-center">статус оплаты/реги</div>
    </div>
  );
};
