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
    if (team === 'A') {
      setTeamAScore(score);
      setTeamBScore(maxPoints - score);
    } else {
      setTeamBScore(score);
      setTeamAScore(maxPoints - score);
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
    <div className="bg-white rounded-[20px] p-[16px] shadow-sm border border-[#EBEDF0]">
      {/* Заголовок матча */}
      <div className="flex justify-between items-center mb-[16px]">
        <div className="flex items-center gap-[8px]">
          <div className="bg-[#F8F8FA] rounded-full px-[12px] py-[4px]">
            <span className="text-[12px] text-[#5D6674]">Корт {match.court}</span>
          </div>
          <div className="bg-[#F8F8FA] rounded-full px-[12px] py-[4px]">
            <span className="text-[12px] text-[#5D6674]">Раунд {match.round}</span>
          </div>
        </div>
        
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-[8px] rounded-full bg-[#F8F8FA] hover:bg-[#EBEDF0] transition-colors"
          >
            {Icons.Edit()}
          </button>
        )}
      </div>

      {/* Команды и счет */}
      <div className="flex items-center justify-between">
        {/* Команда A */}
        <div className="flex-1">
          <div className="text-[14px] font-medium text-[#5D6674] mb-[4px]">
            Команда 1
          </div>
          <div className="text-[16px] font-medium">
            {getPlayerName(match.teamA.player1)}
            {match.teamA.player2 && (
              <>
                <br />
                <span className="text-[14px]">{getPlayerName(match.teamA.player2)}</span>
              </>
            )}
          </div>
        </div>

        {/* Счет */}
        <div className="flex items-center gap-[16px] mx-[20px]">
          {isEditing ? (
            <>
              <div className="flex flex-col items-center gap-[8px]">
                <input
                  type="number"
                  min="0"
                  max={maxPoints}
                  value={teamAScore}
                  onChange={(e) => handleScoreChange('A', parseInt(e.target.value) || 0)}
                  className="w-[60px] h-[60px] text-[24px] font-bold text-center border-2 border-[#AFFF3F] rounded-[12px] bg-[#F8F8FA]"
                />
              </div>
              
              <div className="text-[20px] font-medium text-[#5D6674]">:</div>
              
              <div className="flex flex-col items-center gap-[8px]">
                <input
                  type="number"
                  min="0"
                  max={maxPoints}
                  value={teamBScore}
                  onChange={(e) => handleScoreChange('B', parseInt(e.target.value) || 0)}
                  className="w-[60px] h-[60px] text-[24px] font-bold text-center border-2 border-[#AFFF3F] rounded-[12px] bg-[#F8F8FA]"
                />
              </div>
            </>
          ) : (
            <>
              <div className={twMerge(
                "w-[60px] h-[60px] flex items-center justify-center rounded-[12px] text-[24px] font-bold",
                teamAScore > teamBScore ? "bg-[#AFFF3F] text-black" : "bg-[#F8F8FA] text-[#5D6674]"
              )}>
                {teamAScore}
              </div>
              
              <div className="text-[20px] font-medium text-[#5D6674]">:</div>
              
              <div className={twMerge(
                "w-[60px] h-[60px] flex items-center justify-center rounded-[12px] text-[24px] font-bold",
                teamBScore > teamAScore ? "bg-[#AFFF3F] text-black" : "bg-[#F8F8FA] text-[#5D6674]"
              )}>
                {teamBScore}
              </div>
            </>
          )}
        </div>

        {/* Команда B */}
        <div className="flex-1 text-right">
          <div className="text-[14px] font-medium text-[#5D6674] mb-[4px]">
            Команда 2
          </div>
          <div className="text-[16px] font-medium">
            {getPlayerName(match.teamB.player1)}
            {match.teamB.player2 && (
              <>
                <br />
                <span className="text-[14px]">{getPlayerName(match.teamB.player2)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Кнопки управления при редактировании */}
      {isEditing && (
        <div className="flex gap-[12px] mt-[16px]">
          <button
            onClick={handleCancel}
            className="flex-1 py-[12px] px-[16px] bg-[#F8F8FA] text-[#5D6674] rounded-[16px] font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={teamAScore + teamBScore !== maxPoints}
            className={twMerge(
              "flex-1 py-[12px] px-[16px] rounded-[16px] font-medium transition-colors",
              teamAScore + teamBScore === maxPoints
                ? "bg-[#AFFF3F] text-black hover:bg-[#9FEF2F]"
                : "bg-[#EBEDF0] text-[#A4A9B4] cursor-not-allowed"
            )}
          >
            Сохранить
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
