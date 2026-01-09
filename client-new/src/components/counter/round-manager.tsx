import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import type { TournamentEngineStatus } from "../../types/counter.type";

interface RoundManagerProps {
  currentRound: number;
  totalRounds: number;
  status: TournamentEngineStatus;
  canStartNextRound: boolean;
  onNextRound: () => void;
  onFinishTournament: () => void;
  isLoading?: boolean;
}

export const RoundManager = ({
  currentRound,
  totalRounds,
  status,
  canStartNextRound,
  onNextRound,
  onFinishTournament,
  isLoading = false,
}: RoundManagerProps) => {
  const isLastRound = currentRound >= totalRounds;
  const isFinished = status === "FINISHED";

  return (
    <div className="bg-white rounded-[20px] p-[16px] shadow-sm border border-[#EBEDF0]">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center gap-[8px]">
          {Icons.Clock("black", "20", "20")}
          <h3 className="text-[16px] font-medium">Управление раундами</h3>
        </div>
        
        <div className={twMerge(
          "px-[12px] py-[4px] rounded-[12px] text-[12px] font-medium",
          status === "ACTIVE" ? "bg-[#E7FFC6] text-[#77BE14]" :
          status === "FINISHED" ? "bg-[#F8F8FA] text-[#5D6674]" :
          "bg-[#FFF3CD] text-[#856404]"
        )}>
          {status === "ACTIVE" ? "Активен" :
           status === "FINISHED" ? "Завершен" :
           status === "PAUSED" ? "Приостановлен" : "Не начат"}
        </div>
      </div>

      {/* Прогресс раундов */}
      <div className="mb-[20px]">
        <div className="flex justify-between items-center mb-[8px]">
          <span className="text-[14px] text-[#5D6674]">Прогресс турнира</span>
          <span className="text-[14px] font-medium">
            {isFinished ? totalRounds : currentRound} / {totalRounds}
          </span>
        </div>
        
        <div className="w-full bg-[#F8F8FA] rounded-[8px] h-[8px] overflow-hidden">
          <div
            className="bg-[#AFFF3F] h-full rounded-[8px] transition-all duration-300"
            style={{
              width: `${((isFinished ? totalRounds : currentRound) / totalRounds) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Текущий раунд */}
      {!isFinished && (
        <div className="bg-[#F8F8FA] rounded-[16px] p-[16px] mb-[16px]">
          <div className="text-center">
            <div className="text-[24px] font-bold text-black mb-[4px]">
              Раунд {currentRound}
            </div>
            <div className="text-[14px] text-[#5D6674]">
              {isLastRound ? "Финальный раунд" : `Осталось раундов: ${totalRounds - currentRound}`}
            </div>
          </div>
        </div>
      )}

      {/* Кнопки управления */}
      <div className="space-y-[12px]">
        {!isFinished && !isLastRound && (
          <button
            onClick={onNextRound}
            disabled={!canStartNextRound || isLoading}
            className={twMerge(
              "w-full py-[16px] px-[20px] rounded-[16px] font-medium text-[16px] transition-colors flex items-center justify-center gap-[8px]",
              canStartNextRound && !isLoading
                ? "bg-[#AFFF3F] text-black hover:bg-[#9FEF2F]"
                : "bg-[#EBEDF0] text-[#A4A9B4] cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-[20px] h-[20px] border-2 border-[#A4A9B4] border-t-transparent rounded-full animate-spin" />
                Генерация раунда...
              </>
            ) : (
              <>
                {Icons.ArrowRight("currentColor", "20", "20")}
                Начать раунд {currentRound + 1}
              </>
            )}
          </button>
        )}

        {!isFinished && isLastRound && (
          <button
            onClick={onFinishTournament}
            disabled={!canStartNextRound || isLoading}
            className={twMerge(
              "w-full py-[16px] px-[20px] rounded-[16px] font-medium text-[16px] transition-colors flex items-center justify-center gap-[8px]",
              canStartNextRound && !isLoading
                ? "bg-[#77BE14] text-white hover:bg-[#6BAE12]"
                : "bg-[#EBEDF0] text-[#A4A9B4] cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-[20px] h-[20px] border-2 border-[#A4A9B4] border-t-transparent rounded-full animate-spin" />
                Завершение турнира...
              </>
            ) : (
              <>
                {Icons.Approve("currentColor", "20", "20")}
                Завершить турнир
              </>
            )}
          </button>
        )}

        {isFinished && (
          <div className="text-center py-[16px]">
            <div className="inline-flex items-center gap-[8px] bg-[#E7FFC6] text-[#77BE14] px-[16px] py-[12px] rounded-[16px] font-medium">
              {Icons.Approve("#77BE14", "20", "20")}
              Турнир завершен
            </div>
          </div>
        )}
      </div>

      {/* Подсказка */}
      {!isFinished && !canStartNextRound && (
        <div className="mt-[12px] p-[12px] bg-[#FFF3CD] rounded-[12px]">
          <div className="flex items-start gap-[8px]">
            {Icons.Info("#856404", "16", "16")}
            <div className="text-[12px] text-[#856404]">
              Для продолжения необходимо завершить все матчи текущего раунда
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
