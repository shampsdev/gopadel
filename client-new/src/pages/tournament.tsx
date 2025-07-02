import { useParams } from "react-router";
import { Icons } from "../assets/icons";
import { getRankTitle } from "../utils/rank-title";
import { useTelegramBackButton } from "../shared/hooks/useTelegramBackButton";
import { useGetTournaments } from "../api/hooks/useGetTournaments";
import { useEffect } from "react";

export const Tournament = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { id } = useParams();

  const { data: tournament, isLoading } = useGetTournaments({ id: id! });
  // const { data: waitlist, isLoading: waitlistLoading } =
  //   useGetTournamentWaitlist(id!);

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
    <div className="pb-[100px]">
      <div className="flex flex-col gap-8 pb-[100px]">
        <div className="flex flex-col gap-7">
          <h1>{tournament?.[0]?.name}</h1>
          <div className="flex flex-col gap-5">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-[2px]">
                <p className="text-[14px] text-[#5D6674]">
                  {tournament?.[0].startTime}
                </p>
                <p className="text-[14px] text-[#5D6674]">
                  {tournament?.[0].endTime}
                </p>
              </div>

              <div className="flex flex-col">
                <p className="text-[14px] text-[#5D6674]">
                  {tournament?.[0].price} ₽
                </p>
                <p>участие</p>
              </div>
            </div>

            <div className="flex flex-row justify-between">
              <div className="flex flex-col">
                <p>{tournament?.[0].club.name}</p>
                <p>{tournament?.[0].club.address}</p>
              </div>
              <div>{Icons.Location()}</div>
            </div>

            <div className="flex flex-row justify-between">
              <div className="flex flex-col">
                <p>Тип: {tournament?.[0].tournamentType}</p>
                <p>Ранг: {getRankTitle(tournament?.[0].rankMin || 0)}</p>
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
                {tournament?.[0].participants.length} /{" "}
                {tournament?.[0].maxUsers}
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
                {/* {tournament?.[0].waitlist}{" "}
                {getPersonWord(tournament?.[0].waitlist)} */}
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
    </div>
  );
};
