import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { Tournament as TournamentType } from "../types/tournament.type";
import { Icons } from "../assets/icons";
import { getRankTitle } from "../utils/rank-title";

export const Tournament = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // TODO: грузить не из кеша, а с бэка
  const cachedTournaments = queryClient.getQueryData([
    "tournaments",
    {},
  ]) as TournamentType[];

  const tournament = cachedTournaments?.find(
    (t: TournamentType) => t.id === id
  );

  const waitlist = 1;

  // Функция для правильного склонения слова "человек"
  const getPersonWord = (count: number) => {
    if (count === 1) return "человек";
    if (count >= 2 && count <= 4) return "человека";
    return "человек";
  };

  return (
    <>
      <div className="flex flex-col gap-8 pb-[100px]">
        <div className="flex flex-col gap-7">
          <h1>{tournament?.name}</h1>
          <div className="flex flex-col gap-5">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-[2px]">
                <p className="text-[14px] text-[#5D6674]">
                  {tournament?.startTime}
                </p>
                <p className="text-[14px] text-[#5D6674]">
                  {tournament?.endTime}
                </p>
              </div>

              <div className="flex flex-col">
                <p className="text-[14px] text-[#5D6674]">
                  {tournament?.price} ₽
                </p>
                <p>участие</p>
              </div>
            </div>

            <div className="flex flex-row justify-between">
              <div className="flex flex-col">
                <p>{tournament?.club.name}</p>
                <p>{tournament?.club.address}</p>
              </div>
              <div>{Icons.Location()}</div>
            </div>

            <div className="flex flex-row justify-between">
              <div className="flex flex-col">
                <p>Тип: {tournament?.tournamentType}</p>
                <p>Ранг: {getRankTitle(tournament?.rankMin || 0)}</p>
              </div>
              <div>{Icons.Star()}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-[7px]">
              <p>Участники</p>
              <p className="text-[14px] text-[#F34338]">
                {tournament?.participants.length} / {tournament?.maxUsers}
              </p>
            </div>

            <div className="">смотреть все</div>
          </div>

          <div>карусель пользователей</div>

          <div className="flex flex-row items-center flex-1">
            <div>Иконка</div>
            <div className="flex flex-col gap-[2px]">
              <p>Список ожидания</p>
              <p>
                {waitlist} {getPersonWord(waitlist)}
              </p>
            </div>
          </div>

          <div>{Icons.ArrowRight()}</div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-row justify-between">
            <p>Организатор: {tournament?.organizator.firstName}</p>

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
      </div>
    </>
  );
};
