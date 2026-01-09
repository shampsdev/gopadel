import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { useGetEvents } from "../../api/hooks/useGetEvents";
import { useTournamentApi } from "../../api/hooks/useTournamentApi";
import { Preloader } from "../../components/widgets/preloader";
import { Button } from "../../components/ui/button";
import { twMerge } from "tailwind-merge";
import { RegistrationStatus } from "../../types/registration-status";
import type { Tournament as TournamentType } from "../../types/tournament.type";

interface Match {
  id: string;
  round: number;
  court: number;
  teamA: {
    player1: string;
    player2: string;
  };
  teamB: {
    player1: string;
    player2: string;
  };
  score?: {
    teamA: number;
    teamB: number;
  };
  status: "scheduled" | "in_progress" | "completed";
}

interface TournamentState {
  currentRound: number;
  totalRounds: number;
  matches: Match[];
  leaderboard: Array<{
    userId: string;
    position: number;
    stats: {
      wins: number;
      draws: number;
      losses: number;
      scored: number;
      conceded: number;
      diff: number;
      tablePoints: number;
      wdlPoints: number;
    };
  }>;
  canAdvance: boolean;
}

export const TournamentResults = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { id } = useParams();
  
  const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  const { data: events, isLoading: eventsLoading } = useGetEvents({
    id: id!,
  }) as { data: TournamentType[] | undefined; isLoading: boolean };

  const {
    isLoading: tournamentLoading,
    createTournament,
    startTournament,
    getTournamentState,
    updateMatchScore,
    advanceToNextRound,
    finalizeTournament,
  } = useTournamentApi();

  const event = events?.[0];

  // Проверяем, что турнир заполнен и можно вводить результаты
  const canEnterResults = event?.participants?.filter(p => 
    p.status === RegistrationStatus.CONFIRMED || 
    p.status === RegistrationStatus.PENDING
  ).length === event?.maxUsers;

  const getUserName = (userId: string) => {
    const participant = event?.participants?.find(p => p.userId === userId);
    return participant?.user ? 
      `${participant.user.firstName} ${participant.user.lastName}` : 
      'Неизвестный игрок';
  };

  const fetchTournamentState = async () => {
    if (!id) return;
    
    try {
      const data = await getTournamentState(id);
      setTournamentState(data);
    } catch (error) {
      console.error('Error fetching tournament state:', error);
    }
  };

  const handleCreateTournament = async () => {
    if (!event || !canEnterResults || !id) return;

    const participants = event.participants
      ?.filter(p => p.status === RegistrationStatus.CONFIRMED || p.status === RegistrationStatus.PENDING)
      .map(p => p.userId) || [];

    try {
      const tournamentType = event.data?.tournament?.type;
      const format = tournamentType === "мексикано" ? "MEXICANO" : "AMERICANO";
      
      await createTournament(id, {
        type: tournamentType || "американо",
        format: format,
        mode: "SOLO",
        matchPoints: 16,
        courtsCount: 1,
        currentRound: 0,
        totalRounds: 5,
        settings: {
          autoAdvanceRounds: true,
          allowDraws: false,
          finalEnabled: true
        }
      }, participants);

      await startTournament(id);
      await fetchTournamentState();
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const handleUpdateMatchScore = async (matchId: string, teamAScore: number, teamBScore: number) => {
    if (!id) return;
    
    try {
      await updateMatchScore(id, matchId, teamAScore, teamBScore);
      await fetchTournamentState();
      setEditingMatch(null);
      setScoreA("");
      setScoreB("");
    } catch (error) {
      console.error('Error updating match score:', error);
    }
  };

  const handleAdvanceToNextRound = async () => {
    if (!id) return;
    
    try {
      await advanceToNextRound(id);
      await fetchTournamentState();
    } catch (error) {
      console.error('Error advancing to next round:', error);
    }
  };

  const handleFinalizeTournament = async () => {
    if (!id) return;
    
    try {
      await finalizeTournament(id);
      await fetchTournamentState();
    } catch (error) {
      console.error('Error finalizing tournament:', error);
    }
  };

  useEffect(() => {
    if (canEnterResults) {
      fetchTournamentState();
    }
  }, [event]);

  if (eventsLoading || tournamentLoading) return <Preloader />;

  if (!event) {
    return (
      <div className="flex flex-col gap-8 pb-[100px] px-4">
        <h1 className="text-[24px] font-medium">Турнир не найден</h1>
      </div>
    );
  }

  if (!canEnterResults) {
    return (
      <div className="flex flex-col gap-8 pb-[100px] px-4">
        <h1 className="text-[24px] font-medium">Результаты турнира</h1>
        <div className="bg-[#F8F8FA] rounded-[20px] p-6">
          <div className="flex flex-col gap-4 text-center">
            <div className="text-[16px]">Ввод результатов недоступен</div>
            <div className="text-[14px] text-[#868D98]">
              Результаты можно вводить только для заполненных турниров
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournamentState) {
    return (
      <div className="flex flex-col gap-8 pb-[100px] px-4">
        <h1 className="text-[24px] font-medium">Результаты турнира</h1>
        <div className="bg-[#F8F8FA] rounded-[20px] p-6">
          <div className="flex flex-col gap-4 text-center">
            <div className="text-[16px]">Турнир не создан</div>
            <div className="text-[14px] text-[#868D98] mb-4">
              Создайте турнир, чтобы начать вводить результаты
            </div>
            <Button 
              onClick={handleCreateTournament}
              className="mx-auto"
            >
              Создать турнир
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-[100px] px-4">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-[24px] font-medium">Результаты турнира</h1>
        <div className="text-[14px] text-[#868D98]">
          Раунд {tournamentState.currentRound} из {tournamentState.totalRounds}
        </div>
      </div>

      {/* Текущие матчи */}
      <div className="flex flex-col gap-4">
        <div className="text-[18px] font-medium">Текущий раунд</div>
        {tournamentState.matches
          .filter(match => match.round === tournamentState.currentRound)
          .map((match) => (
            <div key={match.id} className="bg-white rounded-[20px] p-4 border border-[#EBEDF0]">
              <div className="flex flex-col gap-3">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-[14px] text-[#868D98]">
                    Корт {match.court}
                  </div>
                  <div className={twMerge(
                    "px-3 py-1 rounded-full text-[12px]",
                    match.status === "completed" ? "bg-[#E7FFC6] text-[#77BE14]" :
                    match.status === "in_progress" ? "bg-[#FFF3CD] text-[#856404]" :
                    "bg-[#F8F8FA] text-[#868D98]"
                  )}>
                    {match.status === "completed" ? "Завершен" :
                     match.status === "in_progress" ? "Идет" : "Запланирован"}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="text-[14px] font-medium">
                        {getUserName(match.teamA.player1)}
                      </div>
                      <div className="text-[14px] font-medium">
                        {getUserName(match.teamA.player2)}
                      </div>
                    </div>
                    
                    {match.score && (
                      <div className="flex flex-row gap-2 items-center">
                        <div className="text-[18px] font-bold">
                          {match.score.teamA}
                        </div>
                        <div className="text-[14px] text-[#868D98]">:</div>
                        <div className="text-[18px] font-bold">
                          {match.score.teamB}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="h-[1px] bg-[#EBEDF0]"></div>

                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="text-[14px] font-medium">
                        {getUserName(match.teamB.player1)}
                      </div>
                      <div className="text-[14px] font-medium">
                        {getUserName(match.teamB.player2)}
                      </div>
                    </div>
                  </div>
                </div>

                {match.status !== "completed" && (
                  <div className="mt-3">
                    {editingMatch === match.id ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-row gap-2 items-center justify-center">
                          <input
                            type="number"
                            value={scoreA}
                            onChange={(e) => setScoreA(e.target.value)}
                            placeholder="0"
                            className="w-16 h-12 text-center text-[18px] font-bold border border-[#EBEDF0] rounded-[12px]"
                            min="0"
                            max="16"
                          />
                          <div className="text-[16px] text-[#868D98]">:</div>
                          <input
                            type="number"
                            value={scoreB}
                            onChange={(e) => setScoreB(e.target.value)}
                            placeholder="0"
                            className="w-16 h-12 text-center text-[18px] font-bold border border-[#EBEDF0] rounded-[12px]"
                            min="0"
                            max="16"
                          />
                        </div>
                        <div className="flex flex-row gap-2">
                          <Button
                            onClick={() => {
                              const a = parseInt(scoreA) || 0;
                              const b = parseInt(scoreB) || 0;
                              if (a + b === 16) {
                                handleUpdateMatchScore(match.id, a, b);
                              }
                            }}
                            disabled={!scoreA || !scoreB || (parseInt(scoreA) + parseInt(scoreB)) !== 16}
                            className="flex-1 text-[14px] py-3"
                          >
                            Сохранить
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingMatch(null);
                              setScoreA("");
                              setScoreB("");
                            }}
                            className="flex-1 text-[14px] py-3 bg-[#F8F8FA] text-black"
                          >
                            Отмена
                          </Button>
                        </div>
                        <div className="text-[12px] text-[#868D98] text-center">
                          Сумма очков должна равняться 16
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setEditingMatch(match.id)}
                        className="w-full text-[14px] py-3 bg-[#F8F8FA] text-black"
                      >
                        Ввести результат
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Кнопка следующего раунда */}
      {tournamentState.canAdvance && (
        <Button
          onClick={tournamentState.currentRound < tournamentState.totalRounds ? 
            handleAdvanceToNextRound : handleFinalizeTournament}
          className="w-full"
        >
          {tournamentState.currentRound < tournamentState.totalRounds ? 
            "Следующий раунд" : "Завершить турнир"}
        </Button>
      )}

      {/* Таблица лидеров */}
      {tournamentState.leaderboard.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="text-[18px] font-medium">Таблица лидеров</div>
          <div className="bg-white rounded-[20px] overflow-hidden border border-[#EBEDF0]">
            {tournamentState.leaderboard.map((player, index) => (
              <div key={player.userId} className={twMerge(
                "flex flex-row items-center justify-between p-4",
                index !== tournamentState.leaderboard.length - 1 && "border-b border-[#EBEDF0]"
              )}>
                <div className="flex flex-row items-center gap-3">
                  <div className={twMerge(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold",
                    index === 0 ? "bg-[#AFFF3F] text-black" : "bg-[#F8F8FA] text-[#868D98]"
                  )}>
                    {player.position}
                  </div>
                  <div className="text-[14px] font-medium">
                    {getUserName(player.userId)}
                  </div>
                </div>
                <div className="flex flex-row gap-4 text-[12px] text-[#868D98]">
                  <div className="text-center">
                    <div className="font-bold text-black">{player.stats.wdlPoints}</div>
                    <div>очки</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-black">{player.stats.diff > 0 ? '+' : ''}{player.stats.diff}</div>
                    <div>разность</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-black">{player.stats.wins}-{player.stats.draws}-{player.stats.losses}</div>
                    <div>В-Н-П</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
