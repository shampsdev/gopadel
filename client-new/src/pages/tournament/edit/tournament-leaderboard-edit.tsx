import { useParams } from "react-router";
import { useGetTournaments } from "../../../api/hooks/useGetTournaments";
import { Preloader } from "../../../components/widgets/preloader";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { getRankTitle } from "../../../utils/rank-title";
import { PrizeSelector } from "../../../components/ui/froms/prize-selector";
import { useState } from "react";
import type { Prize } from "../../../types/prize.type";
import { Button } from "../../../components/ui/button";
import { usePatchTournament } from "../../../api/hooks/mutations/tournament/usePatchTournament";
import type { TournamentResult } from "../../../types/tournament-result.type";
import type { PlayerPlace } from "../../../types/player-place.type";
import { useNavigate } from "react-router";

export const TournamentLeaderboardEdit = () => {
  useTelegramBackButton({ showOnMount: true });
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tournaments, isLoading } = useGetTournaments({ id: id });
  const { mutateAsync: patchTournament, isPending } = usePatchTournament(id!);

  const existingResults = tournaments?.[0]?.data?.result?.leaderboard;
  const [firstPrizeUserId, setFirstPrizeUserId] = useState<string | null>(
    existingResults?.find((p) => p.place === 1)?.userId || null
  );
  const [secondPrizeUserId, setSecondPrizeUserId] = useState<string | null>(
    existingResults?.find((p) => p.place === 2)?.userId || null
  );
  const [thirdPrizeUserId, setThirdPrizeUserId] = useState<string | null>(
    existingResults?.find((p) => p.place === 3)?.userId || null
  );

  const getUserPrize = (userId: string): Prize | null => {
    if (userId === firstPrizeUserId) return 1;
    if (userId === secondPrizeUserId) return 2;
    if (userId === thirdPrizeUserId) return 3;
    return null;
  };

  const setPrizeForUser = (userId: string, prize: Prize) => {
    // Сначала убираем пользователя с других мест
    if (firstPrizeUserId === userId) setFirstPrizeUserId(null);
    if (secondPrizeUserId === userId) setSecondPrizeUserId(null);
    if (thirdPrizeUserId === userId) setThirdPrizeUserId(null);

    // Затем устанавливаем новое место
    switch (prize) {
      case 1:
        if (firstPrizeUserId && firstPrizeUserId !== userId) {
          // Если место уже занято, убираем предыдущего
        }
        setFirstPrizeUserId(userId);
        break;
      case 2:
        if (secondPrizeUserId && secondPrizeUserId !== userId) {
          // Если место уже занято, убираем предыдущего
        }
        setSecondPrizeUserId(userId);
        break;
      case 3:
        if (thirdPrizeUserId && thirdPrizeUserId !== userId) {
        }
        setThirdPrizeUserId(userId);
        break;
    }
  };

  const clearPrizeForUser = (userId: string) => {
    if (firstPrizeUserId === userId) setFirstPrizeUserId(null);
    if (secondPrizeUserId === userId) setSecondPrizeUserId(null);
    if (thirdPrizeUserId === userId) setThirdPrizeUserId(null);
  };

  // Функция для сохранения результатов турнира
  const handleSaveResults = async () => {
    if (!tournaments?.[0]) return;

    const leaderboard: PlayerPlace[] = [];

    // Добавляем призёров в таблицу лидеров
    if (firstPrizeUserId) {
      leaderboard.push({ place: 1, userId: firstPrizeUserId });
    }
    if (secondPrizeUserId) {
      leaderboard.push({ place: 2, userId: secondPrizeUserId });
    }
    if (thirdPrizeUserId) {
      leaderboard.push({ place: 3, userId: thirdPrizeUserId });
    }

    const tournamentResult: TournamentResult = { leaderboard };

    try {
      await patchTournament({
        data: {
          result: tournamentResult,
        },
      });

      navigate(-1);
    } catch (error) {
      console.error("Ошибка при сохранении результатов:", error);
      alert("Ошибка при сохранении результатов");
    }
  };

  // Проверяем есть ли изменения относительно данных с сервера
  const originalFirstPrize =
    existingResults?.find((p) => p.place === 1)?.userId || null;
  const originalSecondPrize =
    existingResults?.find((p) => p.place === 2)?.userId || null;
  const originalThirdPrize =
    existingResults?.find((p) => p.place === 3)?.userId || null;

  const hasChanges =
    firstPrizeUserId !== originalFirstPrize ||
    secondPrizeUserId !== originalSecondPrize ||
    thirdPrizeUserId !== originalThirdPrize;

  if (isLoading) return <Preloader />;

  if (tournaments) {
    const activeParticipants = tournaments[0].participants.filter(
      (participant) => participant.status === "ACTIVE"
    );

    const sortedParticipants = activeParticipants.sort((a, b) => {
      const prizeA = getUserPrize(a.userId);
      const prizeB = getUserPrize(b.userId);

      if (prizeA && prizeB) {
        return prizeA - prizeB;
      }
      if (prizeA && !prizeB) return -1;
      if (!prizeA && prizeB) return 1;
      return 0;
    });

    return (
      <div className="flex flex-col gap-9 pb-[100px] min-h-screen">
        <div className="flex flex-col gap-4">
          <p className="text-[24px] font-medium">Результаты турнира</p>
          <div className="flex flex-col gap-[6px] text-[#5D6674] text-[16px] font-medium">
            <p>Укажите распределение призовых мест </p>
          </div>
        </div>

        <div className="flex flex-col gap-[20px] justify-around">
          {sortedParticipants.map((userRegistration) => {
            const userPrize = getUserPrize(userRegistration.userId);

            return (
              <div
                key={userRegistration.id}
                className="flex flex-row items-center gap-[21px]"
              >
                <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                  <img
                    className="object-cover w-full h-full"
                    src={userRegistration.user.avatar}
                    alt="avatar"
                  />
                </div>

                <div className="flex flex-row gap-[21px] flex-1 flex-grow items-center">
                  <div className="flex flex-row flex-grow flex-1 ">
                    <div className="flex flex-col gap-[2px]">
                      <p className="text-[14px]">
                        {userRegistration.user.firstName}{" "}
                        {userRegistration.user.lastName}
                      </p>
                      <p className="text-[#868D98] text-[14px]">
                        {getRankTitle(userRegistration.user.rank)}
                      </p>
                    </div>
                  </div>
                  <div className="w-fit h-full flex flex-col rounded-[30px] px-[10px] py-[6px] items-start text-[12px]">
                    <PrizeSelector
                      title={"Место"}
                      value={userPrize}
                      userId={userRegistration.userId}
                      functions={[
                        (userId: string) => setPrizeForUser(userId, 1),
                        (userId: string) => setPrizeForUser(userId, 2),
                        (userId: string) => setPrizeForUser(userId, 3),
                      ]}
                      onClear={clearPrizeForUser}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col fixed bottom-[80px]  right-0 left-0 gap-4 w-full">
          <Button
            onClick={handleSaveResults}
            disabled={isPending || !hasChanges}
            className={
              !hasChanges ? "bg-[#F8F8FA] text-[#A4A9B4] mx-auto" : " mx-auto"
            }
          >
            {isPending ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </div>
    );
  }
};
