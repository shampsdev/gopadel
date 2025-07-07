import { Link, useNavigate, useParams } from "react-router";
import { Icons } from "../../assets/icons";
import { getRankTitle } from "../../utils/rank-title";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { useGetTournaments } from "../../api/hooks/useGetTournaments";
import { useState } from "react";
import { useGetTournamentWaitlist } from "../../api/hooks/useGetTournamentWaitlist";
import { TournamentPlayers } from "../../components/widgets/tournament-players";
import { useAuthStore } from "../../shared/stores/auth.store";
import { TournamentStatusActions } from "../../components/widgets/tournament-status-actions";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { twMerge } from "tailwind-merge";
import { Preloader } from "../../components/widgets/preloader";
import { BOT_NAME } from "../../shared/constants/api";
import { useIsAdmin } from "../../api/hooks/useIsAdmin";

export const Tournament = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);

  const { data: tournament, isLoading } = useGetTournaments({
    id: id!,
  });
  const { data: waitlist } = useGetTournamentWaitlist(id!);
  const { data: isAdmin } = useIsAdmin();

  const getPersonWord = (count: number) => {
    if (count === 1) return "человек";
    if (count >= 2 && count <= 4) return "человека";
    return "человек";
  };

  if (isLoading) return <Preloader />;

  if (!tournament?.[0] || !user || !waitlist) return <></>;

  if (!tournament?.[0])
    return (
      <div className="flex flex-col gap-8 pb-[100px]">
        <div className="flex flex-col gap-7 px-[12px]">
          <h1 className="text-[24px] font-medium">Турнир не найден</h1>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-8 pb-[200px]">
      <div className="flex flex-col gap-7 px-[12px]">
        <h1 className="text-[24px] font-medium">{tournament?.[0]?.name}</h1>

        <div className="flex flex-col">
          {isAdmin?.admin && (
            <div className="py-5 border-b border-[#DADCE0]">
              <div
                onClick={async () => {
                  navigate(`/tournament/${id}/edit`);
                }}
                className="flex flex-row justify-between items-center gap-[18px]"
              >
                <div className="flex flex-col items-center justify-center w-[42px] h-[42px] bg-[#AFFF3F] rounded-full">
                  {Icons.Edit("black", "18", "18")}
                </div>

                <p className="text-black text-[16px] flex-grow">
                  Изменить турнир
                </p>

                {Icons.ArrowRight("#A4A9B4", "24", "24")}
              </div>
            </div>
          )}

          <div className="py-5 border-b border-[#DADCE0]">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col gap-[2px]  text-[14px] text-[#5D6674] ">
                <p className="text-[#000000] text-[16px]">
                  {tournament?.[0].startTime &&
                    new Date(tournament[0].startTime).toLocaleDateString(
                      "ru-RU",
                      {
                        day: "2-digit",
                        month: "long",
                        timeZone: "Europe/Moscow",
                        weekday: "long",
                      }
                    )}
                </p>
                <div className="text-[14px] text-[#868D98] ">
                  {tournament?.[0].startTime &&
                    new Date(tournament[0].startTime).toLocaleTimeString(
                      "ru-RU",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Moscow",
                      }
                    )}
                  {" - "}
                  {tournament?.[0].endTime &&
                    new Date(tournament[0].endTime).toLocaleTimeString(
                      "ru-RU",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Moscow",
                      }
                    )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center w-[42px] h-[42px] rounded-full bg-[#F8F8FA]">
                {Icons.Calendar("black")}
              </div>
            </div>
          </div>

          <div className="py-5 border-b border-[#DADCE0]">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col gap-[2px]">
                <p className="text-[16px] ">{tournament?.[0].court.name}</p>
                <p className="text-[14px] text-[#868D98]">
                  {tournament?.[0].court.address}
                </p>
              </div>

              <div className="w-[42px] h-[42px] bg-[#F8F8FA] rounded-full flex flex-col justify-center items-center">
                {Icons.Location("black")}
              </div>
            </div>
          </div>

          <div className="pt-5 pb-5 border-b border-[#DADCE0]">
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
                    {getRankTitle(tournament?.[0].rankMin || 0) ===
                    getRankTitle(tournament?.[0].rankMax || 0)
                      ? getRankTitle(tournament?.[0].rankMin || 0)
                      : `${getRankTitle(
                          tournament?.[0].rankMin || 0
                        )} - ${getRankTitle(tournament?.[0].rankMax || 0)}`}
                  </p>
                </div>
              </div>

              <div className="w-[42px] h-[42px] bg-[#F8F8FA] rounded-full flex flex-col justify-center items-center">
                {Icons.Star("black")}
              </div>
            </div>
          </div>

          <div className="py-5 ">
            <div className="flex flex-row-reverse justify-between items-center">
              <div className="flex flex-col items-center justify-center w-[42px] h-[42px] rounded-full bg-[#F8F8FA]">
                {Icons.CreditCard("black")}
              </div>

              <div className="flex flex-row gap-[6px] ">
                <div className="flex flex-col">
                  {tournament?.[0].price === 0 ? (
                    <div className="text-[20px] text-[#77BE14]">бесплатно</div>
                  ) : (
                    <div
                      className={twMerge(
                        "text-[20px] ",
                        user.loyalty.discount > 0
                          ? "text-[#77BE14]"
                          : "text-[#5D6674]"
                      )}
                    >
                      <span
                        className={twMerge(
                          "text-black font-semibold text-[20px]",
                          user.loyalty.discount > 0 && "text-[#77BE14]"
                        )}
                      >
                        {user.loyalty.discount > 0
                          ? Math.round(
                              tournament?.[0].price *
                                (1 - user.loyalty.discount / 100)
                            )
                          : tournament?.[0].price}
                      </span>{" "}
                      ₽
                    </div>
                  )}
                  <p className="text-[12px] text-[#868D98]">участие</p>
                </div>
                {user.loyalty.discount > 0 && tournament?.[0].price > 0 && (
                  <div className="text-[14px]  text-[#F34338] line-through">
                    <span className="font-semibold text-[14px] ">
                      {tournament?.[0].price}
                    </span>{" "}
                    <span className="opacity-40">₽</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {tournament?.[0].description.length > 0 && (
            <div className="flex flex-col pt-[20px] gap-[8px]">
              <div className="text-[16px] font-medium">Описание турнира</div>
              <div className="text-[14px] text-[#5D6674]">
                {tournament?.[0].description}
              </div>
            </div>
          )}
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
                  {
                    tournament?.[0].participants.filter(
                      (participant) =>
                        participant.status === "ACTIVE" ||
                        participant.status === "PENDING"
                    ).length
                  }{" "}
                  / {tournament?.[0].maxUsers}
                </p>
              )}

            {tournament &&
              tournament?.[0].participants.filter(
                (participant) =>
                  participant.status === "ACTIVE" ||
                  participant.status === "PENDING"
              ).length >= tournament?.[0].maxUsers && (
                <p className="text-[14px] text-[#F34338]">
                  {
                    tournament?.[0].participants.filter(
                      (participant) =>
                        participant.status === "ACTIVE" ||
                        participant.status === "PENDING"
                    ).length
                  }
                  / {tournament?.[0].maxUsers}
                </p>
              )}
          </div>

          {tournament?.[0].participants.length > 0 && (
            <Link to={`players`}>
              <div className="bg-[#F8F8FA] rounded-[20px] py-[6px] px-[14px] text-[12px] text-[#5D6674]">
                смотреть все
              </div>
            </Link>
          )}
        </div>

        <div className="px-[12px]">
          <TournamentPlayers
            tournamentId={id!}
            registrations={tournament?.[0].participants}
          />
        </div>

        {waitlist && waitlist.length > 0 && (
          <Link to={`/tournament/${id}/waitlist`}>
            <div className="flex flex-row items-center gap-[18px] py-[17px] px-[16px] rounded-[30px] bg-[#F8F8FA]">
              <div className="flex w-[42px] h-[42px] justify-center items-center bg-[#AFFF3F] rounded-full">
                {Icons.Clock("black")}
              </div>
              <div className="flex flex-col gap-[2px] flex-grow">
                <p>Список ожидания</p>
                <p>
                  {waitlist?.length} {getPersonWord(waitlist?.length || 0)}
                </p>
              </div>
              <div>{Icons.ArrowRight("black")}</div>
            </div>
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 ">
        <div className="flex flex-row justify-between pl-[28px] py-[16px] border-[EBEDF0] border-[1px] rounded-[30px] pr-[16px]">
          <div className="flex flex-row flex-wrap items-center gap-1 text-[#5D6674]">
            Организатор:
            <p className="text-black font-medium">
              {tournament?.[0].organizator.firstName}{" "}
              {tournament?.[0].organizator.lastName}
            </p>
          </div>

          <div
            onClick={() => {
              if (tournament[0].organizator.telegramUsername) {
                openTelegramLink(
                  `https://t.me/${tournament[0].organizator.telegramUsername}`
                );
              }
            }}
            className="flex flex-row items-center gap-[10px] px-[16px] py-[12px] text-white rounded-[30px] bg-black"
          >
            <p className="text-[14px] font-medium">Написать</p>
            <div className="">{Icons.Message()}</div>
          </div>
        </div>

        <div
          className={twMerge(
            "flex flex-row items-center gap-[18px] py-[20px] pl-[28px] pr-[16px] rounded-[30px] bg-[#F8F8FA]",
            isCopied ? "text-[#77BE14] bg-[#E7FFC6]" : ""
          )}
        >
          <div className="flex flex-col gap-[2px] flex-grow">
            <p>{isCopied ? "Ссылка скопирована!" : "Поделиться турниром"}</p>
          </div>
          <div
            onClick={() => {
              navigator.clipboard.writeText(
                `https://t.me/${BOT_NAME}/app?startapp=tour-${id}`
              );
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 2000);
            }}
            className="flex flex-col justify-center items-center w-[21px] h-[21px]"
          >
            {isCopied ? Icons.Approve("#77BE14", "21", "21") : Icons.Copy()}
          </div>
        </div>
      </div>

      <TournamentStatusActions
        tournament={tournament?.[0]}
        user={user}
        waitlist={waitlist || []}
      />
    </div>
  );
};
