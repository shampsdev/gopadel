import { postEvent } from "@telegram-apps/sdk-react";
import { useCancelRegistrationAfterPayment } from "../../api/hooks/mutations/registration/cancel-registration-after-payment";
import { useCreatePaymentForTournamentRegistration } from "../../api/hooks/mutations/registration/create-payment-for-tournament-registration";
import { useReactivateCancelledRegistration } from "../../api/hooks/mutations/registration/reactivate-cancelled-registration";
import { useAddUserToWaitlist } from "../../api/hooks/mutations/waitlist/add-user-to-waitlist";
import { useRemoveUserFromWaitlist } from "../../api/hooks/mutations/waitlist/remove-user-from-waitlist";
import { Icons } from "../../assets/icons";
import type { User } from "../../types/user.type";
import type { Waitlist } from "../../types/waitlist.type";
import {
  isRankAllowed,
  isEventFinished,
  isUserRegistered,
  participatingAvailable,
  userHasRegisteredAndHasNotPaid,
  isUserRegisteredAndPaymentProceeded,
  isUserCancelledParticipating,
  isUserInWaitlist,
} from "../../utils/tournament-status-checks";
import { Button } from "../ui/button";
import { useCancelRegistrationBeforePayment } from "../../api/hooks/mutations/registration/cancel-registration-before-payment";
import { useModalStore } from "../../shared/stores/modal.store";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { BOT_NAME } from "../../shared/constants/api";
import { useRegisterToEvent } from "../../api/hooks/mutations/registration/register-to-event";
import { EventStatus } from "../../types/event-status.type";
import type { Tournament } from "../../types/tournament.type";

interface TournamentStatusActionsProps {
  tournament: Tournament;
  user: User;
  waitlist: Waitlist;
}

export const TournamentStatusActions = ({
  tournament,
  user,
  waitlist,
}: TournamentStatusActionsProps) => {
  const { openModal } = useModalStore();
  const { mutateAsync: addUserToWaitlist } = useAddUserToWaitlist();
  const { mutateAsync: removeUserFromWaitlist } = useRemoveUserFromWaitlist();
  const { mutateAsync: registerToEvent } = useRegisterToEvent();
  const { mutateAsync: createPaymentForTournamentRegistration } =
    useCreatePaymentForTournamentRegistration();
  const { mutateAsync: reactivateCancelledRegistration } =
    useReactivateCancelledRegistration();
  const { mutateAsync: cancelRegistrationAfterPayment } =
    useCancelRegistrationAfterPayment();
  const { mutateAsync: cancelRegistrationBeforePayment } =
    useCancelRegistrationBeforePayment();
  if (isEventFinished(tournament)) {
    return (
      <div className="flex flex-col text-center gap-[18px]">
        <div className="mb-10 flex flex-row gap-4 justify-center">
          <Button
            className={
              tournament.status === EventStatus.cancelled
                ? "flex flex-row items-center gap-3 bg-[#FF5053] text-white"
                : "flex flex-row items-center gap-3 bg-[#EBEDF0]"
            }
            onClick={() => {}}
          >
            {tournament.status === EventStatus.cancelled ? (
              <p>Турнир отменен</p>
            ) : (
              <p>Турнир завершен</p>
            )}
            <div className="flex flex-col items-center justify-center w-[18px] h-[18px]">
              {Icons.Approve()}
            </div>
          </Button>
        </div>
      </div>
    );
  }

  if (participatingAvailable(tournament)) {
    if (isUserRegistered(tournament, user)) {
      if (isUserRegisteredAndPaymentProceeded(tournament, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div className="mb-10 fixed bottom-8 z-20 right-0 left-0 flex flex-row gap-4 justify-center">
              <Button
                className="bg-[#FF5053] text-white"
                onClick={async () => {
                  openModal({
                    title: "Уверены, что хотите отказаться от участия?",
                    subtitle: "Ваше место сможет занять другой участник",
                    declineButtonText: "Назад",
                    acceptButtonText: "Отменить регистрацию",
                    declineButtonOnClick: () => {},
                    acceptButtonOnClick: async () => {
                      await cancelRegistrationAfterPayment(tournament.id);
                    },
                  });
                }}
              >
                Отменить регистрацию
              </Button>
            </div>
          </div>
        );
      }

      if (isUserCancelledParticipating(tournament, user)) {
        return (
          <>
            <div className="flex flex-col text-center gap-[18px]">
              <div>
                Для&nbsp;возврата средств обращайтесь к&nbsp;
                <span
                  onClick={() => openTelegramLink("https://t.me/Alievskey")}
                  className="text-[#1599DB] text-[14px] cursor-pointer w-[70%] text-center"
                >
                  @Alievskey
                </span>
              </div>
              <div className="mb-10 fixed bottom-8 z-20 right-0 left-0 flex flex-row gap-4 justify-center">
                <Button
                  onClick={async () => {
                    await reactivateCancelledRegistration(tournament.id);
                  }}
                >
                  Вернуться к участию
                </Button>
              </div>
            </div>
          </>
        );
      }

      if (userHasRegisteredAndHasNotPaid(tournament, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div>Вы зарегистрированы</div>
            <div className="mb-10 fixed bottom-8 z-20 right-0 left-0 flex flex-row gap-4 justify-center">
              <Button
                className="bg-[#FF5053] text-white"
                onClick={async () => {
                  openModal({
                    title: "Уверены, что хотите отказаться от участия?",
                    subtitle: "Ваше место сможет занять другой участник",
                    declineButtonText: "Назад",
                    acceptButtonText: "Отменить регистрацию",
                    declineButtonOnClick: () => {},
                    acceptButtonOnClick: async () => {
                      await cancelRegistrationBeforePayment(tournament.id);
                    },
                  });
                }}
              >
                Не участвую
              </Button>
              <Button
                onClick={async () => {
                  const payment = await createPaymentForTournamentRegistration({
                    eventId: tournament.id,
                    returnUrl: `https://t.me/${BOT_NAME}/app?startapp=${tournament.id}`,
                  });
                  if (payment?.payment_url) {
                    postEvent("web_app_open_link", {
                      url: payment.payment_url,
                    });
                  }
                }}
              >
                Оплатить
              </Button>
            </div>
          </div>
        );
      }

      return <></>;
    }

    if (!isUserRegistered(tournament, user)) {
      if (isRankAllowed(tournament, user)) {
        return (
          <div className="mb-10 fixed bottom-8 z-20 right-0 left-0 flex flex-row gap-4 justify-center">
            <Button
              onClick={async () => {
                await registerToEvent(tournament.id);
              }}
            >
              Зарегистрироваться
            </Button>
          </div>
        );
      }

      if (!isRankAllowed(tournament, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div>
              Ваш ранг не соответствует заявленному для&nbsp;этого турнира
            </div>
          </div>
        );
      }
      return <></>;
    }
  }

  if (!participatingAvailable(tournament)) {
    if (isUserRegisteredAndPaymentProceeded(tournament, user)) {
      return (
        <div className="flex flex-col text-center gap-[18px]">
          <div className="mb-10 fixed bottom-8 z-20 right-0 left-0 flex flex-row gap-4 justify-center">
            <Button
              className="bg-[#FF5053] text-white"
              onClick={async () => {
                openModal({
                  title: "Уверены, что хотите отказаться от участия?",
                  subtitle: "Ваше место сможет занять другой участник",
                  declineButtonText: "Назад",
                  acceptButtonText: "Отменить регистрацию",
                  declineButtonOnClick: () => {},
                  acceptButtonOnClick: async () => {
                    await cancelRegistrationAfterPayment(tournament.id);
                  },
                });
              }}
            >
              Отменить регистрацию
            </Button>
          </div>
        </div>
      );
    }

    if (userHasRegisteredAndHasNotPaid(tournament, user)) {
      return (
        <div className="flex flex-col text-center gap-[18px]">
          <div>Вы зарегистрированы</div>
          <div className="mb-10 fixed bottom-8 z-20 right-0 left-0 flex flex-row gap-4 justify-center">
            <Button
              className="bg-[#FF5053] text-white"
              onClick={async () => {
                openModal({
                  title: "Уверены, что хотите отказаться от участия?",
                  subtitle: "Ваше место сможет занять другой участник",
                  declineButtonText: "Назад",
                  acceptButtonText: "Отменить регистрацию",
                  declineButtonOnClick: () => {},
                  acceptButtonOnClick: async () => {
                    await cancelRegistrationBeforePayment(tournament.id);
                  },
                });
              }}
            >
              Не участвую
            </Button>
            <Button
              onClick={async () => {
                const payment = await createPaymentForTournamentRegistration({
                  eventId: tournament.id,
                  returnUrl: `https://t.me/${BOT_NAME}/app?startapp=${tournament.id}`,
                });
                if (payment?.payment_url) {
                  postEvent("web_app_open_link", {
                    url: payment.payment_url,
                  });
                }
              }}
            >
              Оплатить
            </Button>
          </div>
        </div>
      );
    }

    if (isRankAllowed(tournament, user)) {
      if (isUserInWaitlist(waitlist, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div>Вы в&nbsp;листе ожидания</div>
            <div className="mb-10 fixed bottom-8  right-0 left-0 flex flex-row gap-4 justify-center">
              <Button
                className="bg-[#FF5053] text-white"
                onClick={async () => {
                  await removeUserFromWaitlist(tournament.id);
                }}
              >
                Покинуть лист ожидания
              </Button>
            </div>
          </div>
        );
      }
      if (!isUserInWaitlist(waitlist, user)) {
        return (
          <div className="flex flex-col text-center gap-[18px]">
            <div>
              Сейчас мест нет, но вы можете записаться в&nbsp;лист ожидания
            </div>
            <div className="mb-10 fixed bottom-8 z-20 right-0 left-0 flex flex-row gap-4 justify-center">
              <Button
                onClick={async () => {
                  await addUserToWaitlist(tournament.id);
                }}
              >
                В лист ожидания
              </Button>
            </div>
          </div>
        );
      }
      return <></>;
    }

    if (!isRankAllowed(tournament, user)) {
      return (
        <div className="flex flex-col text-center gap-[18px]">
          <div>
            Ваш ранг не соответствует заявленному для&nbsp;этого турнира
          </div>
        </div>
      );
    }
    return <></>;
  }

  return <></>;
};
