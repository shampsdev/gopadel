import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import type { TournamentMatch, TournamentPlayer } from "../../types/counter.type";

interface MatchScoreCardProps {
  match: TournamentMatch;
  participants: TournamentPlayer[];
  maxPoints: number;
  onScoreUpdate: (matchId: string, teamAScore: number, teamBScore: number) => void;
  disabled?: boolean;
}

export const MatchScoreCard = ({
  match,
  participants,
  maxPoints,
  onScoreUpdate,
  disabled = false,
}: MatchScoreCardProps) => {
  const [teamAScore, setTeamAScore] = useState(match.teamA.score);
  const [teamBScore, setTeamBScore] = useState(match.teamB.score);
  const [isEditing, setIsEditing] = useState(false);

  const getPlayerName = (playerId: string) => {
    return participants.find(p => p.id === playerId)?.name || "Неизвестный игрок";
  };

  const handleScoreChange = (team: 'A' | 'B', score: number) => {
    // Ограничиваем значение от 0 до maxPoints
    const validScore = Math.max(0, Math.min(maxPoints, score));
    
    if (team === 'A') {
      setTeamAScore(validScore);
      setTeamBScore(maxPoints - validScore);
    } else {
      setTeamBScore(validScore);
      setTeamAScore(maxPoints - validScore);
    }
  };

  const handleSave = () => {
    onScoreUpdate(match.id, teamAScore, teamBScore);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTeamAScore(match.teamA.score);
    setTeamBScore(match.teamB.score);
    setIsEditing(false);
  };

  const isCompleted = match.status === 'completed';
  const canEdit = !disabled && !isCompleted;

  return (
    <div className="bg-white rounded-[20px] p-[20px] shadow-lg">
      {/* Заголовок матча */}
      <div className="flex justify-center items-center mb-[16px]">
        <div className="flex items-center gap-[8px]">
          <div className="bg-[#F8F8FA] rounded-full px-[12px] py-[4px]">
            <span className="text-[12px] text-[#5D6674]">Корт {match.court}</span>
          </div>
          <div className="bg-[#F8F8FA] rounded-full px-[12px] py-[4px]">
            <span className="text-[12px] text-[#5D6674]">Раунд {match.round}</span>
          </div>
        </div>
      </div>

      {/* Команды и счет */}
      <div className="flex flex-col gap-[16px]">
        {/* Команды */}
        <div className="flex justify-between items-start gap-[12px]">
          {/* Команда A */}
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-[#5D6674] mb-[4px]">
              Команда 1
            </div>
            <div className="text-[14px] font-medium leading-tight">
              <div className="truncate">{getPlayerName(match.teamA.player1)}</div>
              {match.teamA.player2 && (
                <div className="text-[12px] text-[#5D6674] truncate">
                  {getPlayerName(match.teamA.player2)}
                </div>
              )}
            </div>
          </div>

          {/* Команда B */}
          <div className="flex-1 min-w-0 text-right">
            <div className="text-[12px] font-medium text-[#5D6674] mb-[4px]">
              Команда 2
            </div>
            <div className="text-[14px] font-medium leading-tight">
              <div className="truncate">{getPlayerName(match.teamB.player1)}</div>
              {match.teamB.player2 && (
                <div className="text-[12px] text-[#5D6674] truncate">
                  {getPlayerName(match.teamB.player2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Счет - главный элемент */}
        <div className="flex items-center justify-center gap-[20px] my-[24px]">
          {isEditing ? (
            <>
              <div className="flex flex-col items-center gap-[8px]">
                <input
                  type="number"
                  min="0"
                  max={maxPoints}
                  value={teamAScore}
                  onChange={(e) => handleScoreChange('A', parseInt(e.target.value) || 0)}
                  className="w-[80px] h-[80px] text-[32px] font-bold text-center bg-[#AFFF3F] rounded-[16px] text-black shadow-lg"
                  autoFocus
                />
                <div className="text-[12px] text-[#5D6674] font-medium">
                  Команда 1
                </div>
              </div>
              
              <div className="text-[32px] font-bold text-[#5D6674]">:</div>
              
              <div className="flex flex-col items-center gap-[8px]">
                <div className="w-[80px] h-[80px] text-[32px] font-bold text-center rounded-[16px] bg-[#F8F8FA] flex items-center justify-center text-[#5D6674] shadow-lg">
                  {teamBScore}
                </div>
                <div className="text-[12px] text-[#5D6674] font-medium">
                  Команда 2
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={twMerge(
                "w-[80px] h-[80px] flex items-center justify-center rounded-[16px] text-[32px] font-bold shadow-lg cursor-pointer transition-all hover:scale-105",
                teamAScore > teamBScore ? "bg-[#AFFF3F] text-black" : "bg-[#F8F8FA] text-[#5D6674]"
              )}
              onClick={() => canEdit && setIsEditing(true)}
              >
                {teamAScore}
              </div>
              
              <div className="text-[32px] font-bold text-[#5D6674]">:</div>
              
              <div className={twMerge(
                "w-[80px] h-[80px] flex items-center justify-center rounded-[16px] text-[32px] font-bold shadow-lg cursor-pointer transition-all hover:scale-105",
                teamBScore > teamAScore ? "bg-[#AFFF3F] text-black" : "bg-[#F8F8FA] text-[#5D6674]"
              )}
              onClick={() => canEdit && setIsEditing(true)}
              >
                {teamBScore}
              </div>
            </>
          )}
        </div>

        {/* Подсказка для ввода */}
        {!isEditing && canEdit && (
          <div className="text-center mb-[16px]">
            <div className="text-[12px] text-[#5D6674] bg-[#F8F8FA] rounded-[8px] px-[12px] py-[4px] inline-block">
              Нажмите на счет для редактирования
            </div>
          </div>
        )}
      </div>

      {/* Кнопки управления при редактировании */}
      {isEditing && (
        <div className="flex gap-[16px] mt-[20px]">
          <button
            onClick={handleCancel}
            className="flex-1 py-[16px] px-[20px] bg-[#F8F8FA] text-[#5D6674] rounded-[16px] font-medium text-[16px] hover:bg-[#EBEDF0] transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-[16px] px-[20px] bg-[#AFFF3F] text-black rounded-[16px] font-medium text-[16px] hover:bg-[#9FEF2F] transition-colors shadow-lg"
          >
            Сохранить результат
          </button>
        </div>
      )}

      {/* Статус матча */}
      {isCompleted && (
        <div className="mt-[12px] text-center">
          <div className="inline-flex items-center gap-[8px] bg-[#E7FFC6] text-[#77BE14] px-[12px] py-[6px] rounded-[12px] text-[12px] font-medium">
            {Icons.Approve("#77BE14", "16", "16")}
            Матч завершен
          </div>
        </div>
      )}
    </div>
  );
};
