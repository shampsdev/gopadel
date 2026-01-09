import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";
import type { TournamentPlayer, TournamentFormat } from "../../types/counter.type";

interface LeaderboardProps {
  participants: TournamentPlayer[];
  format: TournamentFormat;
  currentUserId?: string;
}

export const Leaderboard = ({ participants, format, currentUserId }: LeaderboardProps) => {
  // Сортируем участников по правилам турнира
  const sortedParticipants = [...participants].sort((a, b) => {
    // 1. По wdlPoints (очки за победы/ничьи)
    if (a.stats.wdlPoints !== b.stats.wdlPoints) {
      return b.stats.wdlPoints - a.stats.wdlPoints;
    }
    
    // 2. По разности забитых/пропущенных
    if (a.stats.diff !== b.stats.diff) {
      return b.stats.diff - a.stats.diff;
    }
    
    // 3. По забитым очкам
    if (a.stats.tablePoints !== b.stats.tablePoints) {
      return b.stats.tablePoints - a.stats.tablePoints;
    }
    
    // 4. По seed
    return a.seed - b.seed;
  });

  const getPositionNumber = (position: number) => {
    return (
      <div className={twMerge(
        "w-[24px] h-[24px] rounded-full flex items-center justify-center text-[12px] font-bold",
        position === 1 ? "bg-[#FFF3CD] text-[#B45309]" : "text-[#5D6674]"
      )}>
        {position}
      </div>
    );
  };

  const getWinRate = (player: TournamentPlayer) => {
    const totalGames = player.stats.wins + player.stats.draws + player.stats.losses;
    if (totalGames === 0) return 0;
    return Math.round(((player.stats.wins + player.stats.draws * 0.5) / totalGames) * 100);
  };

  return (
    <div className="bg-white rounded-[20px] overflow-hidden shadow-sm">
      {/* Заголовок */}
      <div className="bg-[#F8F8FA] px-[16px] py-[12px]">
        <div className="flex items-center gap-[8px]">
          {Icons.Stack()}
          <h3 className="text-[16px] font-medium">Таблица лидеров</h3>
          <div className="bg-white rounded-full px-[8px] py-[2px]">
            <span className="text-[12px] text-[#5D6674]">{format}</span>
          </div>
        </div>
      </div>

      {/* Заголовки колонок */}
      <div className="px-[16px] py-[8px] bg-[#FAFBFC]">
        <div className="grid grid-cols-12 gap-[8px] text-[12px] text-[#5D6674] font-medium">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Игрок</div>
          <div className="col-span-2 text-center">И/В/П</div>
          <div className="col-span-2 text-center">Очки</div>
          <div className="col-span-2 text-center">Разн.</div>
          <div className="col-span-1 text-center">%</div>
        </div>
      </div>

      {/* Список участников */}
      <div className="max-h-[400px] overflow-y-auto">
        {sortedParticipants.map((player, index) => {
          const position = index + 1;
          const isCurrentUser = player.id === currentUserId;
          
          return (
            <div
              key={player.id}
              className={twMerge(
                "px-[16px] py-[12px] transition-colors",
                position === 1 ? "bg-[#FFF9E6]" : isCurrentUser ? "bg-[#E7FFC6]" : "hover:bg-[#FAFBFC]"
              )}
            >
              <div className="grid grid-cols-12 gap-[8px] items-center">
                {/* Позиция */}
                <div className="col-span-1">
                  {getPositionNumber(position)}
                </div>

                 {/* Имя игрока */}
                 <div className="col-span-4">
                   <div className="text-[14px] font-medium text-black">
                     {player.name}
                   </div>
                   <div className="text-[12px] text-[#5D6674]">
                     Seed: {player.seed}
                   </div>
                 </div>

                {/* Игры/Победы/Поражения */}
                <div className="col-span-2 text-center">
                  <div className="text-[14px] font-medium">
                    {player.stats.wins + player.stats.draws + player.stats.losses}
                  </div>
                  <div className="text-[12px] text-[#5D6674]">
                    {player.stats.wins}/{player.stats.draws}/{player.stats.losses}
                  </div>
                </div>

                {/* Очки */}
                <div className="col-span-2 text-center">
                  <div className="text-[14px] font-medium">
                    {player.stats.wdlPoints}
                  </div>
                  <div className="text-[12px] text-[#5D6674]">
                    {player.stats.tablePoints} заб.
                  </div>
                </div>

                {/* Разность */}
                <div className="col-span-2 text-center">
                  <div className={twMerge(
                    "text-[14px] font-medium",
                    player.stats.diff > 0 ? "text-[#77BE14]" : 
                    player.stats.diff < 0 ? "text-[#F34338]" : "text-[#5D6674]"
                  )}>
                    {player.stats.diff > 0 ? "+" : ""}{player.stats.diff}
                  </div>
                  <div className="text-[12px] text-[#5D6674]">
                    {player.stats.scored}-{player.stats.conceded}
                  </div>
                </div>

                {/* Процент побед */}
                <div className="col-span-1 text-center">
                  <div className="text-[14px] font-medium">
                    {getWinRate(player)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Пустое состояние */}
      {sortedParticipants.length === 0 && (
        <div className="px-[16px] py-[32px] text-center text-[#5D6674]">
          <div className="mb-[8px]">{Icons.Stack()}</div>
          <div className="text-[14px]">Участники не добавлены</div>
        </div>
      )}
    </div>
  );
};
