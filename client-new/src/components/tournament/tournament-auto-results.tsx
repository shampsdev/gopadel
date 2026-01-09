import { Icons } from "../../assets/icons";
import type { Tournament } from "../../types/tournament.type";

interface TournamentAutoResultsProps {
  tournament: Tournament;
}

interface LeaderboardEntry {
  place: number;
  userId: string;
  name: string;
  stats?: {
    wins: number;
    draws: number;
    losses: number;
    scored: number;
    conceded: number;
    tablePoints: number;
  };
}

export const TournamentAutoResults = ({ tournament }: TournamentAutoResultsProps) => {
  // Получаем автоматически сформированные результаты из поля result
  const results = tournament.data?.result;
  
  if (!results || !results.leaderboard || results.leaderboard.length === 0) {
    return null; // Не показываем ничего, если результатов нет
  }

  const isCompleted = results.status === "completed";
  const leaderboard = results.leaderboard;

  return (
    <div className="bg-[#F8F8FA] rounded-[20px] p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex w-[32px] h-[32px] min-w-[32px] min-h-[32px] justify-center items-center bg-[#AFFF3F] rounded-full">
          {Icons.Trophy("black", "16", "16")}
        </div>
        <div className="flex-grow">
          <h3 className="text-[16px] font-semibold">
            {isCompleted ? "Результаты турнира" : "Текущие результаты"}
          </h3>
          {!isCompleted && (
            <div className="flex items-center gap-1 text-[12px] text-[#1976D2]">
              <div className="w-1.5 h-1.5 bg-[#1976D2] rounded-full animate-pulse"></div>
              Обновляется автоматически
            </div>
          )}
        </div>
      </div>

      {/* Упрощенная таблица результатов */}
      <div className="space-y-2">
        {(leaderboard as LeaderboardEntry[]).slice(0, 10).map((entry: LeaderboardEntry, index: number) => (
          <div
            key={entry.userId}
            className={`flex items-center justify-between p-3 rounded-[12px] bg-white ${
              index === 0 && isCompleted
                ? "ring-2 ring-[#FFD700]/30"
                : ""
            }`}
          >
            {/* Место и имя */}
            <div className="flex items-center gap-3">
              <div
                className={`flex w-[28px] h-[28px] justify-center items-center rounded-full text-[14px] font-bold ${
                  index === 0 && isCompleted
                    ? "bg-[#FFD700] text-black"
                    : index === 1 && isCompleted
                    ? "bg-[#C0C0C0] text-black"
                    : index === 2 && isCompleted
                    ? "bg-[#CD7F32] text-white"
                    : "bg-[#EBEDF0] text-[#5D6674]"
                }`}
              >
                {entry.place}
              </div>
              <div className="font-medium text-[15px] truncate max-w-[180px]">
                {entry.name}
              </div>
            </div>

            {/* Очки */}
            <div className="text-right">
              <div className="font-bold text-[16px]">
                {entry.stats?.tablePoints || 0}
              </div>
              <div className="text-[12px] text-[#868D98]">
                очков
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length > 10 && (
        <div className="mt-3 text-center text-[12px] text-[#868D98]">
          И еще {leaderboard.length - 10} участников...
        </div>
      )}
    </div>
  );
};
