import { useCancelRegistrationAfterPayment } from "../../api/hooks/mutations/registration/cancel-registration-after-payment";
import { useReactivateCancelledRegistration } from "../../api/hooks/mutations/registration/reactivate-cancelled-registration";
import { Icons } from "../../assets/icons";
import type { User } from "../../types/user.type";
import {
  isRankAllowed,
  isEventFinished,
  isUserRegistered,
  participatingAvailable,
  isUserCancelledParticipating,
  isUserApproved,
  isUserInvited,
} from "../../utils/game-status-checks";
import { Button } from "../ui/button";
import { useModalStore } from "../../shared/stores/modal.store";
import { useRegisterToEvent } from "../../api/hooks/mutations/registration/register-to-event";
import { EventStatus } from "../../types/event-status.type";
import type { Game } from "../../types/game.type";

interface GameStatusActionsProps {
  game: Game;
  user: User;
}

export const GameStatusActions = ({ game, user }: GameStatusActionsProps) => {
  const { openModal } = useModalStore();
  const { mutateAsync: registerToEvent } = useRegisterToEvent();
  const { mutateAsync: reactivateCancelledRegistration } =
    useReactivateCancelledRegistration();
  const { mutateAsync: cancelRegistrationAfterPayment } =
    useCancelRegistrationAfterPayment();
  if (isEventFinished(game)) {
    return (
      <div className="flex flex-col text-center gap-[18px]">
        <div className="mb-10 flex flex-row gap-4 justify-center">
          <Button
            className="flex flex-row items-center gap-3 bg-[#EBEDF0]"
            onClick={() => {}}
          >
            {game.status === EventStatus.cancelled ? (
              <p>Игра отменена</p>
            ) : (
              <p>Игра завершена</p>
            )}
            <div className="flex flex-col items-center justify-center w-[18px] h-[18px]">
              {Icons.Approve()}
            </div>
          </Button>
        </div>
      </div>
    );
  }

  if (participatingAvailable(game)) {
    if (isUserRegistered(game, user)) {
      if (isUserInvited(game, user)) {
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
                      await cancelRegistrationAfterPayment(game.id);
                    },
                  });
                }}
              >
                Покинуть игру
              </Button>
            </div>
          </div>
        );
      }

      if (isUserCancelledParticipating(game, user)) {
        return (
          <>
            <div className="flex flex-col text-center gap-[18px]">
              <div className="mb-10 fixed bottom-8 z-20 right-0 left-0 flex flex-row gap-4 justify-center">
                <Button
                  onClick={async () => {
                    await reactivateCancelledRegistration(game.id);
                  }}
                >
                  Зарегистрироваться
                </Button>
              </div>
            </div>
          </>
        );
      }

      if (isUserApproved(game, user)) {
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
                      await cancelRegistrationAfterPayment(game.id);
                    },
                  });
                }}
              >
                Не участвую
              </Button>
            </div>
          </div>
        );
      }

      return <></>;
    }

    if (!isUserRegistered(game, user)) {
      return (
        <div className="mb-10 fixed bottom-8 z-20 right-0 left-0 flex flex-row gap-4 justify-center">
          <Button
            onClick={async () => {
              await registerToEvent(game.id);
            }}
          >
            Зарегистрироваться
          </Button>
        </div>
      );
    }
  }

  if (!participatingAvailable(game)) {
    if (isUserApproved(game, user)) {
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
                    await cancelRegistrationAfterPayment(game.id);
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

    return <></>;
  }

  return <></>;
};
