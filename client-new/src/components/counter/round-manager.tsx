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
  onFinishEarly?: () => void;
  isLoading?: boolean;
}

export const RoundManager = ({
  currentRound,
  totalRounds,
  status,
  canStartNextRound,
  onNextRound,
  onFinishTournament,
  onFinishEarly,
  isLoading = false,
}: RoundManagerProps) => {
  const isLastRound = currentRound >= totalRounds;
  const isFinished = status === "FINISHED";

  return (
    <div className="bg-white rounded-[20px] p-[16px] shadow-sm">

      {/* Кнопки управления */}
      <div className="flex gap-[12px]">
        {!isFinished && !isLastRound && (
          <button
            onClick={onNextRound}
            disabled={!canStartNextRound || isLoading}
            className={twMerge(
              "flex-1 py-[14px] px-[16px] rounded-[12px] font-medium text-[14px] transition-colors flex items-center justify-center gap-[6px]",
              canStartNextRound && !isLoading
                ? "bg-[#AFFF3F] text-black hover:bg-[#9FEF2F]"
                : "bg-[#EBEDF0] text-[#A4A9B4] cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-[16px] h-[16px] border-2 border-[#A4A9B4] border-t-transparent rounded-full animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                {Icons.ArrowRight("currentColor", "16", "16")}
                Следующий раунд
              </>
            )}
          </button>
        )}

        {!isFinished && isLastRound && (
          <button
            onClick={onFinishTournament}
            disabled={!canStartNextRound || isLoading}
            className={twMerge(
              "flex-1 py-[14px] px-[16px] rounded-[12px] font-medium text-[14px] transition-colors flex items-center justify-center gap-[6px]",
              canStartNextRound && !isLoading
                ? "bg-[#77BE14] text-white hover:bg-[#6BAE12]"
                : "bg-[#EBEDF0] text-[#A4A9B4] cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-[16px] h-[16px] border-2 border-[#A4A9B4] border-t-transparent rounded-full animate-spin" />
                Завершение...
              </>
            ) : (
              <>
                {Icons.Approve("currentColor", "16", "16")}
                Завершить турнир
              </>
            )}
          </button>
        )}

        {/* Кнопка досрочного завершения */}
        {!isFinished && onFinishEarly && (
          <button
            onClick={onFinishEarly}
            disabled={isLoading}
            className={twMerge(
              "py-[14px] px-[16px] rounded-[12px] font-medium text-[14px] transition-colors flex items-center justify-center gap-[6px]",
              !isLoading
                ? "bg-[#F34338] text-white hover:bg-[#E53E3E]"
                : "bg-[#EBEDF0] text-[#A4A9B4] cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-[16px] h-[16px] border-2 border-[#A4A9B4] border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              <>
                {Icons.Close("currentColor", "16", "16")}
                Завершить досрочно
              </>
            )}
          </button>
        )}

        {isFinished && (
          <div className="flex-1 text-center py-[14px]">
            <div className="inline-flex items-center gap-[6px] bg-[#E7FFC6] text-[#77BE14] px-[12px] py-[8px] rounded-[12px] font-medium text-[14px]">
              {Icons.Approve("#77BE14", "16", "16")}
              Турнир завершен
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
