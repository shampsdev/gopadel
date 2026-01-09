import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { useModalStore } from "../../../shared/stores/modal.store";
import { Preloader } from "../../../components/widgets/preloader";
import { Icons } from "../../../assets/icons";
import { Button } from "../../../components/ui/button";
import { useInitializeTournament } from "../../../api/hooks/useCounterApi";
import { useGetEvents } from "../../../api/hooks/useGetEvents";
import { useIsAdmin } from "../../../api/hooks/useIsAdmin";
import { checkOrganizerRight } from "../../../utils/check-organizer-right";
import type { TournamentFormat, TournamentMode } from "../../../types/counter.type";

export const InitializeTournament = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { openModal } = useModalStore();
  
  const { data: events } = useGetEvents({ id: id! });
  const { data: isAdmin } = useIsAdmin();
  
  const [format, setFormat] = useState<TournamentFormat>("AMERICANO");
  const [mode, setMode] = useState<TournamentMode>("SOLO");
  const [matchPoints, setMatchPoints] = useState(16);
  const [courtsCount, setCourtsCount] = useState(1);

  const { mutateAsync: initializeTournament, isPending } = useInitializeTournament();

  const handleInitialize = async () => {
    openModal({
      title: "Инициализировать турнир?",
      subtitle: "После инициализации турнирный счетчик будет создан и можно будет начинать ведение матчей. Настройки нельзя будет изменить.",
      acceptButtonText: "Инициализировать",
      declineButtonText: "Отмена",
      acceptButtonOnClick: async () => {
        try {
          await initializeTournament({
            eventId: id!,
            data: {
              format,
              mode,
              matchPoints,
              courtsCount,
            }
          });
          navigate(`/tournament/${id}/counter`);
        } catch (error) {
          console.error("Failed to initialize tournament:", error);
        }
      },
      declineButtonOnClick: () => {},
    });
  };

  const matchPointsOptions = [8, 16, 24, 32];
  const courtsOptions = [1, 2, 3, 4];

  // Проверяем права доступа
  const hasAccess = events?.[0] && user && checkOrganizerRight(
    isAdmin?.admin || false, 
    user.id, 
    events[0]
  );

  if (isPending) return <Preloader />;

  // Проверяем права доступа
  if (!hasAccess && events?.[0]) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-[16px]">
        <div className="text-center">
          <div className="mb-[16px] text-[#F34338]">{Icons.Warning()}</div>
          <h2 className="text-[20px] font-medium mb-[8px]">Нет доступа</h2>
          <p className="text-[14px] text-[#5D6674] mb-[20px]">
            Только организатор турнира или администратор может настроить счетчик
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

  return (
    <div className="flex flex-col pb-[100px]">
      {/* Заголовок */}
      <div className="mb-[24px]">
        <h1 className="text-[24px] font-medium mb-[8px]">Настройка турнира</h1>
        <p className="text-[14px] text-[#5D6674]">
          Выберите формат и параметры для ведения счета турнира
        </p>
      </div>

      <div className="space-y-[24px]">
        {/* Формат турнира */}
        <div className="bg-white rounded-[20px] p-[16px] shadow-sm border border-[#EBEDF0]">
          <h3 className="text-[16px] font-medium mb-[12px]">Формат турнира</h3>
          
          <div className="grid grid-cols-2 gap-[12px]">
            <button
              onClick={() => setFormat("AMERICANO")}
              className={twMerge(
                "p-[16px] rounded-[16px] border-2 transition-colors text-left",
                format === "AMERICANO"
                  ? "border-[#AFFF3F] bg-[#F8FFF0]"
                  : "border-[#EBEDF0] bg-white hover:border-[#D1D5DB]"
              )}
            >
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className={twMerge(
                  "w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center",
                  format === "AMERICANO" ? "border-[#AFFF3F] bg-[#AFFF3F]" : "border-[#D1D5DB]"
                )}>
                  {format === "AMERICANO" && Icons.Approve("black", "12", "12")}
                </div>
                <span className="font-medium">AMERICANO</span>
              </div>
              <p className="text-[12px] text-[#5D6674]">
                Фиксированные раунды, максимум разнообразия партнёров
              </p>
            </button>

            <button
              onClick={() => setFormat("MEXICANO")}
              className={twMerge(
                "p-[16px] rounded-[16px] border-2 transition-colors text-left",
                format === "MEXICANO"
                  ? "border-[#AFFF3F] bg-[#F8FFF0]"
                  : "border-[#EBEDF0] bg-white hover:border-[#D1D5DB]"
              )}
            >
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className={twMerge(
                  "w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center",
                  format === "MEXICANO" ? "border-[#AFFF3F] bg-[#AFFF3F]" : "border-[#D1D5DB]"
                )}>
                  {format === "MEXICANO" && Icons.Approve("black", "12", "12")}
                </div>
                <span className="font-medium">MEXICANO</span>
              </div>
              <p className="text-[12px] text-[#5D6674]">
                Пары формируются по лидерборду после каждого раунда
              </p>
            </button>
          </div>
        </div>

        {/* Режим игры */}
        <div className="bg-white rounded-[20px] p-[16px] shadow-sm border border-[#EBEDF0]">
          <h3 className="text-[16px] font-medium mb-[12px]">Режим игры</h3>
          
          <div className="grid grid-cols-2 gap-[12px]">
            <button
              onClick={() => setMode("SOLO")}
              className={twMerge(
                "p-[16px] rounded-[16px] border-2 transition-colors text-left",
                mode === "SOLO"
                  ? "border-[#AFFF3F] bg-[#F8FFF0]"
                  : "border-[#EBEDF0] bg-white hover:border-[#D1D5DB]"
              )}
            >
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className={twMerge(
                  "w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center",
                  mode === "SOLO" ? "border-[#AFFF3F] bg-[#AFFF3F]" : "border-[#D1D5DB]"
                )}>
                  {mode === "SOLO" && Icons.Approve("black", "12", "12")}
                </div>
                <span className="font-medium">SOLO</span>
              </div>
              <p className="text-[12px] text-[#5D6674]">
                Индивидуальные игроки, пары меняются каждый раунд
              </p>
            </button>

            <button
              onClick={() => setMode("PAIR")}
              className={twMerge(
                "p-[16px] rounded-[16px] border-2 transition-colors text-left",
                mode === "PAIR"
                  ? "border-[#AFFF3F] bg-[#F8FFF0]"
                  : "border-[#EBEDF0] bg-white hover:border-[#D1D5DB]"
              )}
            >
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className={twMerge(
                  "w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center",
                  mode === "PAIR" ? "border-[#AFFF3F] bg-[#AFFF3F]" : "border-[#D1D5DB]"
                )}>
                  {mode === "PAIR" && Icons.Approve("black", "12", "12")}
                </div>
                <span className="font-medium">PAIR</span>
              </div>
              <p className="text-[12px] text-[#5D6674]">
                Постоянные пары, играют как команды
              </p>
            </button>
          </div>
        </div>

        {/* Очки за матч */}
        <div className="bg-white rounded-[20px] p-[16px] shadow-sm border border-[#EBEDF0]">
          <h3 className="text-[16px] font-medium mb-[12px]">Очки за матч</h3>
          
          <div className="grid grid-cols-4 gap-[8px]">
            {matchPointsOptions.map(points => (
              <button
                key={points}
                onClick={() => setMatchPoints(points)}
                className={twMerge(
                  "py-[12px] px-[16px] rounded-[12px] border-2 transition-colors font-medium",
                  matchPoints === points
                    ? "border-[#AFFF3F] bg-[#F8FFF0] text-black"
                    : "border-[#EBEDF0] bg-white hover:border-[#D1D5DB] text-[#5D6674]"
                )}
              >
                {points}
              </button>
            ))}
          </div>
          
          <p className="text-[12px] text-[#5D6674] mt-[8px]">
            Общее количество очков в матче (сумма счета обеих команд)
          </p>
        </div>

        {/* Количество кортов */}
        <div className="bg-white rounded-[20px] p-[16px] shadow-sm border border-[#EBEDF0]">
          <h3 className="text-[16px] font-medium mb-[12px]">Количество кортов</h3>
          
          <div className="grid grid-cols-4 gap-[8px]">
            {courtsOptions.map(courts => (
              <button
                key={courts}
                onClick={() => setCourtsCount(courts)}
                className={twMerge(
                  "py-[12px] px-[16px] rounded-[12px] border-2 transition-colors font-medium",
                  courtsCount === courts
                    ? "border-[#AFFF3F] bg-[#F8FFF0] text-black"
                    : "border-[#EBEDF0] bg-white hover:border-[#D1D5DB] text-[#5D6674]"
                )}
              >
                {courts}
              </button>
            ))}
          </div>
          
          <p className="text-[12px] text-[#5D6674] mt-[8px]">
            Количество доступных кортов для одновременной игры
          </p>
        </div>

        {/* Предварительный расчет */}
        <div className="bg-[#F8F8FA] rounded-[20px] p-[16px]">
          <h3 className="text-[16px] font-medium mb-[12px]">Предварительный расчет</h3>
          
          <div className="space-y-[8px] text-[14px]">
            <div className="flex justify-between">
              <span className="text-[#5D6674]">Формат:</span>
              <span className="font-medium">{format} {mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5D6674]">Очки за матч:</span>
              <span className="font-medium">{matchPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5D6674]">Кортов:</span>
              <span className="font-medium">{courtsCount}</span>
            </div>
          </div>
        </div>

        {/* Кнопка инициализации */}
        <Button
          onClick={handleInitialize}
          className="w-full py-[18px] text-[17px] font-medium"
          disabled={isPending}
        >
          {isPending ? "Инициализация..." : "Инициализировать турнир"}
        </Button>
      </div>
    </div>
  );
};
