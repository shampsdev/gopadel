import { Link, useNavigate, useParams } from "react-router";
import { Icons } from "../../assets/icons";
import { getRankTitle } from "../../utils/rank-title";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { useGetEvents } from "../../api/hooks/useGetEvents";
import { useEffect, useState } from "react";
import { useGetEventWaitlist } from "../../api/hooks/useGetEventWaitlist";
import { TournamentPlayers } from "../../components/widgets/tournament-players";
import { useAuthStore } from "../../shared/stores/auth.store";
import { TournamentStatusActions } from "../../components/widgets/tournament-status-actions";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { twMerge } from "tailwind-merge";
import { Preloader } from "../../components/widgets/preloader";
import { BOT_NAME } from "../../shared/constants/api";
import { useIsAdmin } from "../../api/hooks/useIsAdmin";
import { Prize } from "../../components/widgets/prize";
import { getPrizeString } from "../../utils/get-prize-string";
import { checkOrganizerRight } from "../../utils/check-organizer-right";
import { LinksWrapper } from "../../components/helpers/links-wrapper";
import { RegistrationStatus } from "../../types/registration-status";
import type { Waitlist } from "../../types/waitlist.type";
import { EventStatus } from "../../types/event-status.type";
import type { Tournament as TournamentType } from "../../types/tournament.type";
import { EventStatusView } from "../../components/ui/event-status-view";
import { TournamentStatusWarning } from "../../components/widgets/tournament-status-warning";
import { usePatchEvent } from "../../api/hooks/mutations/events/usePatchEvent";
import { useModalStore } from "../../shared/stores/modal.store";
import { useTournamentEditStore } from "../../shared/stores/tournament-edit.store";

export const Tournament = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);

  const { data: events, isLoading } = useGetEvents({
    id: id!,
  }) as { data: TournamentType[] | undefined; isLoading: boolean };
  const { data: waitlist } = useGetEventWaitlist(id!);
  const { data: isAdmin } = useIsAdmin();

  const { openModal } = useModalStore();
  const { mutateAsync: patchEvent, isPending: isUpdatingEvent } = usePatchEvent(
    id!
  );

  const { resetStore } = useTournamentEditStore();

  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const getPersonWord = (count: number) => {
    if (count === 1) return "человек";
    if (count >= 2 && count <= 4) return "человека";
    return "человек";
  };

  useEffect(() => {
    resetStore();
  }, []);

  if (isLoading) return <Preloader />;

  if (!events?.[0] || !user || !waitlist) return <></>;

  if (isUpdatingEvent) return <Preloader />;
  if (!events?.[0])
    return (
      <div className="flex flex-col gap-8 pb-[100px]">
        <div className="flex flex-col gap-7 px-[12px]">
          <h1 className="text-[24px] font-medium">Турнир не найден</h1>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col pb-[200px]">
      <div className="flex flex-row justify-between relative">
        <h1 className="text-[24px] font-medium">{events?.[0]?.name}</h1>
        {checkOrganizerRight(
          isAdmin?.admin || false,
          user?.id,
          events?.[0]
        ) && (
          <>
            {" "}
            <button onClick={() => setIsActionsOpen(!isActionsOpen)}>
              {Icons.Actions()}
            </button>
            <div
              className={twMerge(
                "flex flex-col absolute z-100 bg-white rounded-[18px] p-[16px] right-0 top-[30px] shadow-xl transition-all duration-200 ease-out transform-gpu",
                isActionsOpen
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
              )}
            >
              <div
                onClick={() => {
                  navigate(`/tournament/${id}/edit`);
                }}
                className="flex-row flex gap-[16px] py-[8px] px-[16px]"
              >
                <div>{Icons.Edit()}</div>
                <p>Редактировать</p>
              </div>

              {events?.[0].status !== EventStatus.cancelled && (
                <div
                  onClick={async () => {
                    setIsActionsOpen(false);
                    openModal({
                      title: "Уверены, что хотите отменить событие?",
                      subtitle:
                        "Восстановить заполненную информацию будет невозможно",
                      declineButtonText: "Назад",
                      acceptButtonText: "Отменить событие",
                      declineButtonOnClick: () => {},
                      acceptButtonOnClick: async () => {
                        await patchEvent({ status: EventStatus.cancelled });
                      },
                    });
                  }}
                  className="flex-row flex gap-[16px] text-[#F34338] py-[8px] px-[16px]"
                >
                  <div>{Icons.Delete()}</div>
                  <p>Отменить событие</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-[4px] mt-[12px]">
        <TournamentStatusWarning
          tournament={events?.[0]}
          user={user}
          waitlist={(waitlist as Waitlist) || []}
        />
        <div className="flex flex-row gap-[4px]">
          <div className="flex min-w-[25%] text-[14px] flex-col bg-black text-white rounded-[16px] px-[16px] py-[10px]">
            <p className="opacity-[75%]">турнир</p>
            <p>{events?.[0].data?.tournament?.type}</p>
          </div>

          <div className="bg-[#F8F8FA] px-[16px] py-[10px] flex-1 rounded-[16px] text-[14px] flex items-center justify-start">
            {getRankTitle(events?.[0].rankMin || 0) ===
            getRankTitle(events?.[0].rankMax || 0)
              ? getRankTitle(events?.[0].rankMin || 0)
              : `${getRankTitle(events?.[0].rankMin || 0)} - ${getRankTitle(
                  events?.[0].rankMax || 0
                )}`}
          </div>
        </div>
      </div>

      {!checkOrganizerRight(isAdmin?.admin || false, user?.id, events?.[0]) ? (
        !(events?.[0].status === EventStatus.completed) && (
          <Prize variant="not-finished" />
        )
      ) : (
        <div className="flex flex-col mt-[12px]">
          <div className="py-5 ">
            <div
              onClick={async () => {
                navigate(`/tournament/${id}/leaderboard`);
              }}
              className="flex flex-row justify-between items-center gap-[18px]"
            >
              <div className="flex flex-col items-center justify-center w-[42px] h-[42px] min-w-[42px] min-h-[42px] bg-[#041124] rounded-full">
                {Icons.Stack()}
              </div>

              <div className="text-black text-[16px] flex-grow flex flex-col gap-[2px]">
                <p>Результаты турнира</p>
                <div className="text-[#868D98] text-[12px]">
                  Ваш результат:{" "}
                  <span className="text-black">
                    {(events?.[0].status !== EventStatus.completed ||
                      !events?.[0].participants?.find(
                        (participant) => participant.userId === user?.id
                      )) &&
                      "-"}
                    {events?.[0].status === EventStatus.completed &&
                      events?.[0].participants?.find(
                        (participant) => participant.userId === user?.id
                      ) &&
                      getPrizeString(
                        events?.[0].data?.result?.leaderboard.find(
                          (place) => place.userId === user?.id
                        )?.place
                      )}
                  </span>
                </div>
              </div>

              {Icons.ArrowRight("#A4A9B4", "24", "24")}
            </div>

            {events?.[0].description.length > 0 && (
              <div className="flex flex-col pt-[20px] gap-[8px]">
                <div className="text-[16px] font-medium">Описание турнира</div>
                <div className="text-[14px] text-[#5D6674]">
                  <LinksWrapper text={events?.[0].description} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-[12px] mt-[16px]">
        <div className="flex flex-row gap-[12px] items-center">
          <div className="bg-[#F8F8FA] rounded-full p-[12px]">
            {Icons.Calendar("black", "18", "18")}
          </div>
          <div className="flex flex-col gap-[2px] flex-1">
            <p>
              {" "}
              {events?.[0].startTime &&
                new Date(events[0].startTime).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "long",
                  timeZone: "Europe/Moscow",
                  weekday: "long",
                })}
            </p>
            <p className="text-[14px] text-[#868D98]">
              {events?.[0].startTime &&
                new Date(events[0].startTime).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Europe/Moscow",
                })}
              {" - "}
              {events?.[0].endTime &&
                new Date(events[0].endTime).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Europe/Moscow",
                })}
            </p>
          </div>
          <EventStatusView status={events?.[0].status} />
        </div>

        <div className="flex flex-row gap-[12px] items-center">
          <div className="bg-[#F8F8FA] rounded-full p-[12px]">
            {Icons.Location("black", "18", "18")}
          </div>
          <div className="flex flex-col gap-[2px] flex-1">
            <p>{events?.[0].court.name}</p>
            <p className="text-[14px] text-[#868D98]">
              {events?.[0].court.address}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-[12px] items-center">
          <div className="bg-[#F8F8FA] rounded-full p-[12px]">
            {Icons.CreditCard("black", "18", "18")}
          </div>
          <div className="flex flex-col gap-[2px] flex-1">
            {events?.[0].price === 0 ? (
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
                        events?.[0].price * (1 - user.loyalty.discount / 100)
                      )
                    : events?.[0].price}
                </span>{" "}
                ₽
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 mt-[24px]">
        <div className="flex flex-row justify-between items-center px-[8px]">
          <div className="flex flex-row gap-[7px] items-center">
            <p>Участники</p>

            {events?.[0] &&
              events?.[0].participants?.length &&
              events?.[0].participants?.length < events?.[0].maxUsers && (
                <p className="text-[14px] text-[#000000]">
                  {
                    events?.[0].participants?.filter(
                      (participant) =>
                        participant.status === RegistrationStatus.CONFIRMED ||
                        participant.status === RegistrationStatus.PENDING
                    ).length
                  }{" "}
                  / {events?.[0].maxUsers}
                </p>
              )}

            {events?.[0] &&
              events?.[0].participants?.length &&
              events?.[0].participants?.filter(
                (participant) =>
                  participant.status === RegistrationStatus.CONFIRMED ||
                  participant.status === RegistrationStatus.PENDING
              ).length >= events?.[0].maxUsers && (
                <p className="text-[14px] text-[#F34338]">
                  {
                    events?.[0].participants?.filter(
                      (participant) =>
                        participant.status === RegistrationStatus.CONFIRMED ||
                        participant.status === RegistrationStatus.PENDING
                    ).length
                  }
                  / {events?.[0].maxUsers}
                </p>
              )}
          </div>

          {events?.[0] &&
            events?.[0].participants?.length &&
            events?.[0].participants?.length > 0 && (
              <Link to={`players`}>
                <div className="bg-[#F8F8FA] rounded-[20px] py-[6px] px-[14px] text-[12px] text-[#5D6674]">
                  смотреть все
                </div>
              </Link>
            )}
        </div>

        <div className="px-[8px]">
          <TournamentPlayers
            tournamentId={id!}
            registrations={events?.[0].participants}
          />
        </div>

        {waitlist && waitlist.length > 0 && (
          <Link to={`/tournament/${id}/waitlist`}>
            <div className="flex flex-row items-center  gap-[18px] py-[17px] px-[16px] rounded-[30px] bg-[#F8F8FA]">
              <div className="flex w-[42px] h-[42px] min-w-[42px] min-h-[42px] justify-center items-center bg-[#AFFF3F] rounded-full">
                {Icons.Clock("black", "18", "18")}
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

      <div className="flex flex-col gap-3 mt-[24px]">
        <div className="flex flex-row justify-between pl-[28px] py-[16px] border-[EBEDF0] border-[1px] rounded-[30px] pr-[16px]">
          <div className="flex flex-row flex-wrap items-center gap-1 text-[#5D6674]">
            Организатор:
            <p className="text-black font-medium">
              {events?.[0].organizer.firstName} {events?.[0].organizer.lastName}
            </p>
          </div>

          <div
            onClick={() => {
              if (events?.[0].organizer.telegramUsername) {
                openTelegramLink(
                  `https://t.me/${events?.[0].organizer.telegramUsername}`
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
                `https://t.me/${BOT_NAME}/app?startapp=${id}`
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
        tournament={events?.[0]}
        user={user}
        waitlist={(waitlist as Waitlist) || []}
      />
    </div>
  );
};
