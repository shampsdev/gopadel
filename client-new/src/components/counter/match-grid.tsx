import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import { MatchScoreCard } from "./match-score-card";
import type { TournamentMatch, TournamentPlayer } from "../../types/counter.type";

interface MatchGridProps {
  matches: TournamentMatch[];
  participants: TournamentPlayer[];
  currentRound: number;
  courtsCount: number;
  maxPoints: number;
  onMatchStart?: (matchId: string) => void;
  onScoreUpdate: (matchId: string, teamAScore: number, teamBScore: number) => void;
  disabled?: boolean;
}

export const MatchGrid = ({
  matches,
  participants,
  currentRound,
  courtsCount,
  maxPoints,
  onMatchStart,
  onScoreUpdate,
  disabled = false,
}: MatchGridProps) => {
  // Фильтруем матчи текущего раунда
  const currentRoundMatches = matches.filter(match => match.round === currentRound);
  
  // Группируем матчи по кортам
  const matchesByCourt = Array.from({ length: courtsCount }, (_, courtIndex) => {
    const courtNumber = courtIndex + 1;
    return currentRoundMatches.filter(match => match.court === courtNumber);
  });

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#E7FFC6] text-[#77BE14]';
      case 'in_progress':
        return 'bg-[#FFF3CD] text-[#856404]';
      default:
        return 'bg-[#F8F8FA] text-[#5D6674]';
    }
  };

  const getMatchStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершен';
      case 'in_progress':
        return 'Идет игра';
      default:
        return 'Ожидает';
    }
  };

  const completedMatches = currentRoundMatches.filter(match => match.status === 'completed').length;
  const totalMatches = currentRoundMatches.length;

  return (
    <div className="space-y-[20px]">
      {/* Заголовок с прогрессом */}
      <div className="bg-white rounded-[20px] p-[16px] shadow-sm border border-[#EBEDF0]">
        <div className="flex items-center justify-between mb-[12px]">
          <div className="flex items-center gap-[8px]">
            {Icons.Grid()}
            <h3 className="text-[16px] font-medium">Матчи раунда {currentRound}</h3>
          </div>
          
          <div className="text-[14px] font-medium">
            {completedMatches} / {totalMatches}
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="w-full bg-[#F8F8FA] rounded-[8px] h-[6px] overflow-hidden">
          <div
            className="bg-[#AFFF3F] h-full rounded-[8px] transition-all duration-300"
            style={{
              width: totalMatches > 0 ? `${(completedMatches / totalMatches) * 100}%` : '0%'
            }}
          />
        </div>
      </div>

      {/* Сетка кортов */}
      {courtsCount > 1 ? (
        <div className="grid gap-[16px]">
          {matchesByCourt.map((courtMatches, courtIndex) => {
            const courtNumber = courtIndex + 1;
            const hasMatches = courtMatches.length > 0;
            
            return (
              <div key={courtNumber} className="space-y-[12px]">
                {/* Заголовок корта */}
                <div className="flex items-center gap-[8px] px-[4px]">
                  <div className="bg-[#041124] text-white rounded-full w-[24px] h-[24px] flex items-center justify-center text-[12px] font-medium">
                    {courtNumber}
                  </div>
                  <span className="text-[14px] font-medium">Корт {courtNumber}</span>
                  
                  {hasMatches && (
                    <div className={twMerge(
                      "px-[8px] py-[2px] rounded-[8px] text-[10px] font-medium",
                      getMatchStatusColor(courtMatches[0].status)
                    )}>
                      {getMatchStatusText(courtMatches[0].status)}
                    </div>
                  )}
                </div>

                {/* Матчи корта */}
                {hasMatches ? (
                  courtMatches.map(match => (
                    <MatchScoreCard
                      key={match.id}
                      match={match}
                      participants={participants}
                      maxPoints={maxPoints}
                      onScoreUpdate={onScoreUpdate}
                      disabled={disabled}
                    />
                  ))
                ) : (
                  <div className="bg-[#F8F8FA] rounded-[20px] p-[20px] text-center">
                    <div className="text-[#5D6674] text-[14px]">
                      Нет матчей на этом корте
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Один корт - показываем матчи без группировки
        <div className="space-y-[12px]">
          {currentRoundMatches.length > 0 ? (
            currentRoundMatches.map(match => (
              <MatchScoreCard
                key={match.id}
                match={match}
                participants={participants}
                maxPoints={maxPoints}
                onScoreUpdate={onScoreUpdate}
                disabled={disabled}
              />
            ))
          ) : (
            <div className="bg-[#F8F8FA] rounded-[20px] p-[32px] text-center">
              <div className="mb-[8px]">{Icons.Grid()}</div>
              <div className="text-[#5D6674] text-[14px]">
                Нет матчей в этом раунде
              </div>
            </div>
          )}
        </div>
      )}

      {/* Пустое состояние */}
      {totalMatches === 0 && (
        <div className="bg-white rounded-[20px] p-[32px] text-center shadow-sm border border-[#EBEDF0]">
          <div className="mb-[12px] text-[#5D6674]">{Icons.Grid()}</div>
          <div className="text-[16px] font-medium mb-[4px]">Матчи не созданы</div>
          <div className="text-[14px] text-[#5D6674]">
            Матчи будут сгенерированы автоматически при начале раунда
          </div>
        </div>
      )}
    </div>
  );
};
