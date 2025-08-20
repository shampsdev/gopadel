import { useState } from "react";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { Input } from "../../components/ui/froms/input";
import { Textarea } from "../../components/ui/froms/textarea";
import { CourtSelector } from "../../components/ui/froms/court-selector";
import { ClubSelector } from "../../components/ui/froms/club-selector";
import { PlayerCountSelector } from "../../components/ui/froms/player-count-selector";
import {
  formatDateInput,
  validateDateFormat,
  formatTimeInput,
  validateTimeFormat,
  createStartAndEndTime,
} from "../../utils/date-format";
import { Button } from "../../components/ui/button";
import { RankSelector } from "../../components/ui/froms/rank-selector";
import { ranks } from "../../shared/constants/ranking";
import { useAuthStore } from "../../shared/stores/auth.store";
import { useGetCourts } from "../../api/hooks/useGetCourts";
import { useGetMyClubs } from "../../api/hooks/useGetMyClubs";
import { useNavigate } from "react-router";
import { useIsAdmin } from "../../api/hooks/useIsAdmin";
import { Preloader } from "../../components/widgets/preloader";
import AboutImage from "../../assets/about.png";
import type { CreateGame as CreateGameType } from "../../types/create-event.type";
import { EventType } from "../../types/event-type.type";
import { useCreateEvent } from "../../api/hooks/mutations/events/useCreateEvent";
import { useCreateGameStore } from "../../shared/stores/create-game.store";
import { Icons } from "../../assets/icons";
import { DateSelector } from "../../components/ui/froms/date-selector";
import { LevelSelector } from "../../components/ui/froms/level-selector";
import { TimeSelector } from "../../components/ui/froms/time-selector";

export const CreateGame = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const {
    title,
    setTitle,
    description,
    setDescription,
    selectedDate,
    setDateFromCalendar,
    time,
    timeError,
    setTime,
    type,
    setType,
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
    typeFieldOpen,
    setTypeFieldOpen,
  } = useCreateGameStore();

  const { data: courts = [], isLoading: courtsLoading } = useGetCourts();
  const { data: myClubs = [], isLoading: clubsLoading } = useGetMyClubs();

  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const { mutateAsync: createEvent, isPending: isCreatingEvent } =
    useCreateEvent();

  const handleCreateGame = async () => {
    const gameData = getGameData();

    if (!gameData) {
      return;
    }

    try {
      const game = await createEvent({
        ...gameData,
        organizerId: user?.id ?? "",
        type: EventType.game,
      } as CreateGameType);
      if (game?.id) {
        navigate(`/game/${game?.id}`);
      } else {
        alert("Игра успешно создана");
        navigate("/");
      }
    } catch (error) {
      alert("Ошибка при создании игры");
      console.error(error);
    }
  };

  if (isAdminLoading || courtsLoading || clubsLoading) return <Preloader />;

  if (!isAdmin?.admin) {
    return (
      <div className="flex flex-col h-screen w-full">
        <div className="flex-1 flex flex-col text-center items-center justify-center gap-11">
          <img src={AboutImage} className="object-cover w-[70%]" />
          <div className="flex flex-col gap-4">
            <div className="font-semibold text-[20px]">Функция недоступна</div>
            <div className="text-[#868D98]">
              Создание турниров доступно только администраторам
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
          <p className="text-[24px] font-medium">Новая игра</p>
          <p className="text-[#5D6674] text-[16px]">
            Добавьте информацию о событии
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Input
            onChangeFunction={setTitle}
            title={"Название"}
            value={title}
            maxLength={100}
            hasError={!title}
          />
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

          <div className="flex flex-col gap-[8px] mt-[16px]">
            <div className="text-[#868D98] text-[15px] px-[16px] font-medium ">
              Тип
            </div>
            <div className="flex flex-row gap-[4px] text-center">
              <div
                className={
                  "w-full  py-[12px] rounded-[12px] text-[14px] cursor-pointer " +
                  (typeFieldOpen || type !== "американо"
                    ? "bg-[#F8F8FA]"
                    : "bg-[#AFFF3F]")
                }
                onClick={() => {
                  setTypeFieldOpen(false);
                  setType("американо");
                }}
              >
                американо
              </div>
              <div
                className={
                  "w-full  py-[12px] rounded-[12px] text-[14px] cursor-pointer " +
                  (typeFieldOpen || type !== "мексикано"
                    ? "bg-[#F8F8FA]"
                    : "bg-[#AFFF3F]")
                }
                onClick={() => {
                  setTypeFieldOpen(false);
                  setType("мексикано");
                }}
              >
                мексикано
              </div>
            </div>
            <div className="flex flex-row gap-[4px] text-center">
              <div
                className={
                  "w-full  py-[12px] text-[14px] cursor-pointer " +
                  (typeFieldOpen
                    ? "bg-[#AFFF3F] rounded-[12px]"
                    : "bg-[#F8F8FA] rounded-[12px]")
                }
                onClick={() => setTypeFieldOpen(true)}
              >
                что-нибудь ещё
              </div>
              <div className="w-full bg-white py-[12px]"></div>
            </div>
          </div>

          {typeFieldOpen && (
            <Input
              onChangeFunction={setType}
              title={"Тип"}
              value={type}
              maxLength={100}
              hasError={!type}
            />
          )}
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
            title="Уровень турнира"
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
              onClick={() => setMaxUsersInput("8")}
            >
              8
            </div>
            <div
              className="px-[24px] py-[16px] rounded-[12px] font-medium text-[18px] bg-[#F8F8FA]"
              onClick={() => setMaxUsersInput("16")}
            >
              16
            </div>
            <div
              className="px-[24px] py-[16px] rounded-[12px] font-medium text-[18px] bg-[#F8F8FA]"
              onClick={() => setMaxUsersInput("24")}
            >
              24
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col fixed bottom-[80px]  right-0 left-0 gap-4 w-full">
        <Button
          disabled={isCreatingEvent}
          onClick={() => {
            if (isFormValid()) {
              handleCreateGame();
            }
          }}
          className={
            !isFormValid() ? "bg-[#F8F8FA] text-[#A4A9B4]" : " mx-auto"
          }
        >
          Создать игру
        </Button>
      </div>
    </div>
  );
};
