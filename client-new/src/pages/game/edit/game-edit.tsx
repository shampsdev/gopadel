import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { usePatchEvent } from "../../../api/hooks/mutations/events/usePatchEvent";
import { useGetCourts } from "../../../api/hooks/useGetCourts";
import { useGetEvents } from "../../../api/hooks/useGetEvents";
import { Button } from "../../../components/ui/button";
import { CourtSelector } from "../../../components/ui/froms/court-selector";
import { Input } from "../../../components/ui/froms/input";

import { Textarea } from "../../../components/ui/froms/textarea";
import { TimeSelector } from "../../../components/ui/froms/time-selector";
import { Preloader } from "../../../components/widgets/preloader";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { useGameEditStore } from "../../../shared/stores/game-edit.store";

import AboutImage from "../../../assets/about.png";
import { DateSelector } from "../../../components/ui/froms/date-selector";
import { Icons } from "../../../assets/icons";
import { LevelSelector } from "../../../components/ui/froms/level-selector";
import { checkGameOrganizerRight } from "../../../utils/check-organizer-right";
import { useAuthStore } from "../../../shared/stores/auth.store";

export const GameEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const {
    title,
    description,
    setDescription,
    selectedDate,
    setDateFromCalendar,
    time,
    timeError,
    setTime,
    courtId,
    setCourtId,
    rankMin,
    rankMax,
    rankMinError,
    rankMaxError,
    setRankMinValue,
    setRankMaxValue,
    price,
    priceInput,
    setPriceInput,
    handlePriceBlur,
    maxUsers,
    maxUsersInput,
    setMaxUsersInput,
    handleMaxUsersBlur,
    isFormValid,
    getGameData,
    loadFromEvent,
    loadedFromEvent,
    duration,
    setDuration,
  } = useGameEditStore();

  const { data: courts = [], isLoading: courtsLoading } = useGetCourts();

  const { user } = useAuthStore();

  const { mutateAsync: patchEvent, isPending: isUpdatingEvent } = usePatchEvent(
    id!
  );

  const { data: events, isLoading: eventLoading } = useGetEvents({ id: id! });
  const event = events?.[0];

  useEffect(() => {
    if (event && !loadedFromEvent) {
      loadFromEvent(event);
    }
  }, [event, loadFromEvent, loadedFromEvent]);

  const handleUpdateGame = async () => {
    const gameData = getGameData();

    if (!gameData) {
      return;
    }

    try {
      await patchEvent(gameData);
      navigate(-1);
    } catch (error) {
      alert("Ошибка при обновлении игры");
      console.error(error);
    }
  };

  if (courtsLoading || eventLoading || !event) return <Preloader />;

  if (!checkGameOrganizerRight(user?.id || "", event!)) {
    return (
      <div className="flex flex-col h-screen w-full">
        <div className="flex-1 flex flex-col text-center items-center justify-center gap-11">
          <img src={AboutImage} className="object-cover w-[70%]" />
          <div className="flex flex-col gap-4">
            <div className="font-semibold text-[20px]">Функция недоступна</div>
            <div className="text-[#868D98]">
              Редактирование игр доступно только организаторам
            </div>
          </div>
        </div>
        <div className="mt-auto pb-10">
          <Button className="mx-auto" onClick={() => navigate("/")}>
            Назад
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col h-screen w-full">
        <div className="flex-1 flex flex-col text-center items-center justify-center gap-11">
          <img src={AboutImage} className="object-cover w-[70%]" />
          <div className="flex flex-col gap-4">
            <div className="font-semibold text-[20px]">Игра не найдена</div>
            <div className="text-[#868D98]">
              Запрашиваемая игра не существует
            </div>
          </div>
        </div>
        <div className="mt-auto pb-10">
          <Button className="mx-auto" onClick={() => navigate("/")}>
            Назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[40px] pb-[200px]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 px-[12px]">
          <p className="text-[24px] font-medium">Редактировать игру</p>
          <p className="text-[#5D6674] text-[16px]">
            Измените информацию о событии
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-[6px]">
            <p className="text-[#868D98] font-medium">Название</p>
            <p>{title}</p>
          </div>
          <Textarea
            onChangeFunction={setDescription}
            title={"Описание"}
            value={description}
            maxLength={500}
            placeholder={""}
            hasError={false}
          />
          <div className="flex flex-row px-[16px] justify-between">
            <div className="flex flex-row gap-[2px]">
              <p className="text-[#868D98] font-medium">Дата</p>
              <div className="mt-[4px]">{Icons.RequiredFieldStar()}</div>
            </div>
            <div
              className="flex flex-row gap-[8px] items-center text-[#868D98]"
              onClick={() => navigate(`calendar`)}
            >
              <p>открыть календарь</p>
              <div>{Icons.Calendar("#868D98", "16", "16")}</div>
            </div>
          </div>

          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setDateFromCalendar}
          />
          <TimeSelector
            title={"Начало"}
            value={time.split("-")[0] || ""}
            onChangeFunction={(startTime: string) => {
              // Устанавливаем только время начала, время окончания будет рассчитано на основе duration
              setTime(startTime);
            }}
            hasError={timeError}
          />
          <div className="text-[#868D98] font-medium px-[16px]">
            {"Продолжительность (в часах)"}
          </div>
          <div className="flex flex-row gap-[4px]">
            <div
              className={
                "text-center py-[16px] w-full " +
                (duration === 1
                  ? "bg-[#AFFF3F] rounded-[12px]"
                  : "bg-[#F8F8FA] rounded-[12px]")
              }
              onClick={() => setDuration(1)}
            >
              1
            </div>
            <div
              className={
                "text-center py-[16px] w-full " +
                (duration === 1.5
                  ? "bg-[#AFFF3F] rounded-[12px]"
                  : "bg-[#F8F8FA] rounded-[12px]")
              }
              onClick={() => setDuration(1.5)}
            >
              1,5
            </div>
            <div
              className={
                "text-center py-[16px] w-full " +
                (duration === 2
                  ? "bg-[#AFFF3F] rounded-[12px]"
                  : "bg-[#F8F8FA] rounded-[12px]")
              }
              onClick={() => setDuration(2)}
            >
              2
            </div>
          </div>

          <CourtSelector
            title="Корт"
            value={courtId}
            onChangeFunction={(id) => {
              setCourtId(id);
            }}
            hasError={!courtId}
            courts={courts ?? []}
          />
          <LevelSelector
            title="Уровень игры"
            minValue={rankMin}
            maxValue={rankMax}
            onChangeMinValue={setRankMinValue}
            onChangeMaxValue={setRankMaxValue}
            hasError={
              rankMin === null ||
              rankMinError ||
              rankMax === null ||
              rankMaxError
            }
          />
          <div className="flex flex-col gap-[8px] mt-[16px]"></div>
          <Input
            title={"Стоимость участия"}
            value={priceInput}
            maxLength={10}
            placeholder={"0"}
            hasError={price === null}
            onChangeFunction={setPriceInput}
            onBlur={handlePriceBlur}
          />
          <Input
            title={"Максимальное количество участников"}
            value={maxUsersInput}
            maxLength={3}
            placeholder={"0"}
            hasError={maxUsers === null}
            onChangeFunction={setMaxUsersInput}
            onBlur={handleMaxUsersBlur}
          />
          <div className="flex flex-row gap-[4px]">
            <div
              className="px-[24px] py-[16px] rounded-[12px] font-medium text-[18px] bg-[#F8F8FA]"
              onClick={() => setMaxUsersInput("2")}
            >
              2
            </div>
            <div
              className="px-[24px] py-[16px] rounded-[12px] font-medium text-[18px] bg-[#F8F8FA]"
              onClick={() => setMaxUsersInput("4")}
            >
              4
            </div>
            <div
              className="px-[24px] py-[16px] rounded-[12px] font-medium text-[18px] bg-[#F8F8FA]"
              onClick={() => setMaxUsersInput("8")}
            >
              8
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col fixed bottom-[80px]  right-0 left-0 gap-4 w-full">
        <Button
          disabled={isUpdatingEvent}
          onClick={() => {
            if (isFormValid()) {
              handleUpdateGame();
            }
          }}
          className={
            !isFormValid() ? "bg-[#F8F8FA] text-[#A4A9B4] mx-auto" : " mx-auto"
          }
        >
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};
