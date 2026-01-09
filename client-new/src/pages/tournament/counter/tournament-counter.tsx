import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { useModalStore } from "../../../shared/stores/modal.store";
import { Preloader } from "../../../components/widgets/preloader";
import { Icons } from "../../../assets/icons";
import { useGetEvents } from "../../../api/hooks/useGetEvents";
import { useIsAdmin } from "../../../api/hooks/useIsAdmin";
import { checkOrganizerRight } from "../../../utils/check-organizer-right";
import { 
  useGetTournamentState, 
  useUpdateMatchScore, 
  useNextRound, 
  useFinishTournament 
} from "../../../api/hooks/useCounterApi";
import { MatchGrid } from "../../../components/counter/match-grid";
import { Leaderboard } from "../../../components/counter/leaderboard";
import { RoundManager } from "../../../components/counter/round-manager";

export const TournamentCounter = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { openModal } = useModalStore();

  // API хуки
  const { data: tournamentState, isLoading, error } = useGetTournamentState(id!);
  const { data: events } = useGetEvents({ id: id! });
  const { data: isAdmin } = useIsAdmin();
  const { mutateAsync: updateMatchScore, isPending: isUpdatingScore } = useUpdateMatchScore();
  const { mutateAsync: nextRound, isPending: isStartingRound } = useNextRound();
  const { mutateAsync: finishTournament, isPending: isFinishingTournament } = useFinishTournament();

  const handleScoreUpdate = async (matchId: string, teamAScore: number, teamBScore: number) => {
    try {
      await updateMatchScore({
        eventId: id!,
        matchId,
        data: {
          teamA: { score: teamAScore },
          teamB: { score: teamBScore }
        }
      });
    } catch (error) {
      console.error("Failed to update match score:", error);
    }
  };

  const handleNextRound = async () => {
    openModal({
      title: "Начать следующий раунд?",
      subtitle: "Убедитесь, что все матчи текущего раунда завершены. Это действие нельзя отменить.",
      acceptButtonText: "Начать раунд",
      declineButtonText: "Отмена",
      acceptButtonOnClick: async () => {
        try {
          await nextRound(id!);
        } catch (error) {
          console.error("Failed to start next round:", error);
        }
      },
      declineButtonOnClick: () => {},
    });
  };

  const handleFinishTournament = async () => {
    openModal({
      title: "Завершить турнир?",
      subtitle: "После завершения турнира нельзя будет изменить результаты. Убедитесь, что все матчи проведены.",
      acceptButtonText: "Завершить турнир",
      declineButtonText: "Отмена",
      acceptButtonOnClick: async () => {
        try {
          await finishTournament(id!);
          navigate(`/tournament/${id}`);
        } catch (error) {
          console.error("Failed to finish tournament:", error);
        }
      },
      declineButtonOnClick: () => {},
    });
  };

  const handleFinishEarly = async () => {
    openModal({
      title: "Завершить турнир досрочно?",
      subtitle: "⚠️ ВНИМАНИЕ: Это действие нельзя отменить! Турнир будет завершен с текущими результатами. Все незавершенные матчи будут аннулированы.",
      acceptButtonText: "Да, завершить досрочно",
      declineButtonText: "Отмена",
      acceptButtonOnClick: async () => {
        try {
          await finishTournament(id!);
          navigate(`/tournament/${id}`);
        } catch (error) {
          console.error("Failed to finish tournament early:", error);
        }
      },
      declineButtonOnClick: () => {},
    });
  };

  // Проверяем, можно ли начать следующий раунд
  const canStartNextRound = tournamentState?.matches
    .filter(match => match.round === tournamentState.currentRound)
    .every(match => match.status === 'completed') ?? false;

  // Проверяем права доступа
  const hasAccess = events?.[0] && user && checkOrganizerRight(
    isAdmin?.admin || false, 
    user.id, 
    events[0]
  );

  if (isLoading) return <Preloader />;

  // Проверяем права доступа
  if (!hasAccess && events?.[0]) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-[16px]">
        <div className="text-center">
          <div className="mb-[16px] text-[#F34338]">{Icons.Warning()}</div>
          <h2 className="text-[20px] font-medium mb-[8px]">Нет доступа</h2>
          <p className="text-[14px] text-[#5D6674] mb-[20px]">
            Только организатор турнира или администратор может вести счет
          </p>
          <button
            onClick={() => navigate(`/tournament/${id}`)}
            className="bg-[#AFFF3F] text-black py-[12px] px-[20px] rounded-[16px] font-medium"
          >
            Вернуться к турниру
          </button>
        </div>
      </div>
    );
  }

  // Если турнир не инициализирован, перенаправляем на страницу инициализации
  if (error && error.message?.includes("tournament not initialized")) {
    navigate(`/tournament/${id}/counter/initialize`);
    return <Preloader />;
  }

  if (error || !tournamentState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-[16px]">
        <div className="text-center">
          <div className="mb-[16px] text-[#F34338]">{Icons.Warning()}</div>
          <h2 className="text-[20px] font-medium mb-[8px]">Ошибка загрузки</h2>
          <p className="text-[14px] text-[#5D6674] mb-[20px]">
            {error?.message?.includes("tournament not initialized") 
              ? "Турнир не настроен для ведения счета"
              : "Не удалось загрузить данные турнира"
            }
          </p>
          <button
            onClick={() => {
              if (error?.message?.includes("tournament not initialized")) {
                navigate(`/tournament/${id}/counter/initialize`);
              } else {
                navigate(`/tournament/${id}`);
              }
            }}
            className="bg-[#AFFF3F] text-black py-[12px] px-[20px] rounded-[16px] font-medium"
          >
            {error?.message?.includes("tournament not initialized") 
              ? "Настроить счетчик"
              : "Вернуться к турниру"
            }
          </button>
        </div>
      </div>
    );
  }

  const isLoading_any = isUpdatingScore || isStartingRound || isFinishingTournament;

  return (
    <div className="flex flex-col pb-[100px] px-[16px]">
      {/* Заголовок */}
      <div className="flex items-start justify-between mb-[16px] gap-[12px]">
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] sm:text-[24px] font-medium">Ведение счета</h1>
          <div className="flex items-center gap-[6px] mt-[4px] flex-wrap">
            <div className="bg-[#F8F8FA] rounded-full px-[8px] py-[2px]">
              <span className="text-[10px] text-[#5D6674]">{tournamentState.format}</span>
            </div>
            <div className="bg-[#F8F8FA] rounded-full px-[8px] py-[2px]">
              <span className="text-[10px] text-[#5D6674]">{tournamentState.mode}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/tournament/${id}`)}
          className="p-[8px] bg-[#F8F8FA] rounded-full hover:bg-[#EBEDF0] transition-colors flex-shrink-0"
        >
          {Icons.Close()}
        </button>
      </div>

      {/* Матчи раунда */}
      <div className="mb-[16px]">
        <MatchGrid
          matches={tournamentState.matches}
          participants={tournamentState.participants}
          currentRound={tournamentState.currentRound}
          courtsCount={tournamentState.matches.length > 0 ? 
            Math.max(...tournamentState.matches.map(m => m.court)) : 1}
           maxPoints={tournamentState.matchPoints}
          onScoreUpdate={handleScoreUpdate}
          disabled={isLoading_any || tournamentState.status === "FINISHED"}
        />
      </div>

      {/* Управление раундами */}
      <div className="mb-[16px]">
        <RoundManager
          currentRound={tournamentState.currentRound}
          totalRounds={tournamentState.totalRounds}
          status={tournamentState.status}
          canStartNextRound={canStartNextRound}
          onNextRound={handleNextRound}
          onFinishTournament={handleFinishTournament}
          onFinishEarly={handleFinishEarly}
          isLoading={isLoading_any}
        />
      </div>

      {/* Таблица лидеров */}
      <Leaderboard
        participants={tournamentState.participants}
        format={tournamentState.format}
        currentUserId={user?.id}
      />

      {/* Индикатор загрузки */}
      {isLoading_any && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-[24px] flex items-center gap-[16px]">
            <div className="w-[24px] h-[24px] border-2 border-[#AFFF3F] border-t-transparent rounded-full animate-spin" />
            <span className="text-[16px] font-medium">
              {isUpdatingScore && "Обновление счета..."}
              {isStartingRound && "Генерация раунда..."}
              {isFinishingTournament && "Завершение турнира..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
