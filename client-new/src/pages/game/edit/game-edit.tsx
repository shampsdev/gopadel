import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { usePatchEvent } from "../../../api/hooks/mutations/events/usePatchEvent";
import { useGetCourts } from "../../../api/hooks/useGetCourts";
import { useGetEvents } from "../../../api/hooks/useGetEvents";
import { useIsAdmin } from "../../../api/hooks/useIsAdmin";
import { Button } from "../../../components/ui/button";
import { CourtSelector } from "../../../components/ui/froms/court-selector";
import { EventStatusSelector } from "../../../components/ui/froms/event-status-selector";
import { Input } from "../../../components/ui/froms/input";
import { PlayerCountSelector } from "../../../components/ui/froms/player-count-selector";
import { RankSelector } from "../../../components/ui/froms/rank-selector";
import { Textarea } from "../../../components/ui/froms/textarea";
import { Preloader } from "../../../components/widgets/preloader";
import { ranks } from "../../../shared/constants/ranking";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import {
  validateDateFormat,
  validateTimeFormat,
  createStartAndEndTime,
  formatDateInput,
  formatTimeInput,
} from "../../../utils/date-format";
import AboutImage from "../../../assets/about.png";
import type { PatchEvent } from "../../../types/patch-tournament";
import { EventStatus } from "../../../types/event-status.type";

export const GameEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [dateError, setDateError] = useState<boolean>(false);

  const [time, setTime] = useState<string>("");
  const [timeError, setTimeError] = useState<boolean>(false);
  const [clubName, setClubName] = useState<string>("");
  const [clubAddress, setClubAddress] = useState<string>("");

  const [type, setType] = useState<string>("");
  const [courtId, setCourtId] = useState<string>("");
  const [rankMin, setRankMin] = useState<number | null>(null);
  const [rankMax, setRankMax] = useState<number | null>(null);
  const [rankMinInput, setRankMinInput] = useState<string>("");
  const [rankMaxInput, setRankMaxInput] = useState<string>("");
  const [rankMinError, setRankMinError] = useState<boolean>(false);
  const [rankMaxError, setRankMaxError] = useState<boolean>(false);

  const { data: courts = [], isLoading: courtsLoading } = useGetCourts();

  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const { mutateAsync: patchEvent, isPending: isUpdatingEvent } = usePatchEvent(
    id!
  );

  const { data: events, isLoading: eventLoading } = useGetEvents({ id: id! });
  const event = events?.[0];

  useEffect(() => {
    if (event) {
      setTitle(event.name || "");
      setDescription(event.description || "");

      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);

      const formattedDate = startDate
        .toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
        .replace(/\//g, ".");

      const startTime = startDate.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const endTime = endDate.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setDate(formattedDate);
      setTime(`${startTime}-${endTime}`);
      setClubName(event.court?.name || "");
      setClubAddress(event.court?.address || "");
      setType(event.data?.game?.type || "");
      setCourtId(event.court?.id || "");

      const minRank = ranks.find(
        (r) => event.rankMin >= r.from && event.rankMin <= r.to
      );
      const maxRank = ranks.find(
        (r) => event.rankMax >= r.from && event.rankMax <= r.to
      );

      if (minRank) {
        setRankMinInput(minRank.title);
        setRankMin(minRank.from);
      }

      if (maxRank) {
        setRankMaxInput(maxRank.title);
        setRankMax(maxRank.from);
      }

      setPrice(event.price);
      setPriceInput(event.price.toString());
      setMaxUsers(event.maxUsers);
      setStatus(event.status || EventStatus.registration);
    }
  }, [event]);

  const handleRankMinChange = (rankTitle: string) => {
    setRankMinInput(rankTitle);
    const selectedRank = ranks.find((r) => r.title === rankTitle);
    if (selectedRank) {
      setRankMin(selectedRank.from);
      setRankMinError(false);
      if (rankMax !== null && selectedRank.from > rankMax) {
        setRankMaxError(true);
      } else {
        setRankMaxError(false);
      }
    }
  };

  const handleRankMaxChange = (rankTitle: string) => {
    setRankMaxInput(rankTitle);
    const selectedRank = ranks.find((r) => r.title === rankTitle);
    if (selectedRank) {
      setRankMax(selectedRank.from);
      setRankMaxError(false);
      // Проверяем, что минимальный ранг не больше максимального
      if (rankMin !== null && selectedRank.from < rankMin) {
        setRankMinError(true);
      } else {
        setRankMinError(false);
      }
    }
  };

  const [price, setPrice] = useState<number>(0);
  const [priceInput, setPriceInput] = useState<string>("");
  const [maxUsers, setMaxUsers] = useState<number>(0);
  const [status, setStatus] = useState<EventStatus | null>(null);

  const isFormValid = () => {
    return (
      title &&
      date &&
      time &&
      validateDateFormat(date) &&
      validateTimeFormat(time) &&
      clubName &&
      clubAddress &&
      type &&
      courtId &&
      status !== null &&
      rankMin !== null &&
      rankMin >= 0 &&
      rankMax !== null &&
      rankMax >= 0 &&
      rankMax >= rankMin &&
      price !== null &&
      price >= 0 &&
      maxUsers !== null &&
      maxUsers > 0
    );
  };

  const handleUpdateTournament = async () => {
    if (!date || !time) {
      return;
    }

    if (!validateDateFormat(date)) {
      return;
    }

    if (!validateTimeFormat(time)) {
      return;
    }

    if (!courtId) {
      return;
    }

    const { startTime: start, endTime: end } = createStartAndEndTime(
      date,
      time
    );

    if (!start || !end) {
      return;
    }

    const tournamentData: PatchEvent = {
      courtId: courtId,
      description: description,
      endTime: end,
      maxUsers: maxUsers,
      name: title,
      price: price,
      rankMax: ranks.find((r) => r.title === rankMaxInput)?.to ?? 0,
      rankMin: ranks.find((r) => r.title === rankMinInput)?.from ?? 0,
      startTime: start,
      status: status || undefined,
      data: { game: { type: type } },
    };

    try {
      await patchEvent(tournamentData);
      navigate(-1);
    } catch (error) {
      alert("Ошибка при обновлении турнира");
      console.error(error);
    }
  };

  if (isAdminLoading || courtsLoading || eventLoading) return <Preloader />;

  if (!isAdmin?.admin) {
    return (
      <div className="flex flex-col h-screen w-full">
        <div className="flex-1 flex flex-col text-center items-center justify-center gap-11">
          <img src={AboutImage} className="object-cover w-[70%]" />
          <div className="flex flex-col gap-4">
            <div className="font-semibold text-[20px]">Функция недоступна</div>
            <div className="text-[#868D98]">
              Редактирование турниров доступно только администраторам
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
            <div className="font-semibold text-[20px]">Турнир не найден</div>
            <div className="text-[#868D98]">
              Запрашиваемый турнир не существует
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
          <Input
            onChangeFunction={(value) => {
              const formatted = formatDateInput(value);
              setDate(formatted);

              if (validateDateFormat(formatted)) {
                setDateError(false);
              } else {
                setDateError(formatted.length > 0);
              }
            }}
            onBlur={() => {
              if (!validateDateFormat(date)) {
                setDateError(true);
              } else {
                setDateError(false);
              }
            }}
            title={"Дата"}
            value={date}
            maxLength={8}
            placeholder={"дд.мм.гг"}
            hasError={dateError}
          />
          <Input
            onChangeFunction={(value) => {
              const formatted = formatTimeInput(value);
              setTime(formatted);

              if (validateTimeFormat(formatted)) {
                setTimeError(false);
              } else {
                setTimeError(formatted.length > 0);
              }
            }}
            onBlur={() => {
              if (!validateTimeFormat(time)) {
                setTimeError(true);
              } else {
                setTimeError(false);
              }
            }}
            title={"Время"}
            value={time}
            maxLength={11}
            placeholder={"чч:мм-чч:мм"}
            hasError={timeError}
          />

          <Input
            onChangeFunction={setClubName}
            title={"Место"}
            value={clubName}
            maxLength={100}
            hasError={!clubName}
          />
          <Input
            onChangeFunction={setClubAddress}
            title={"Адрес"}
            value={clubAddress}
            maxLength={240}
            hasError={!clubAddress}
          />
          <Input
            onChangeFunction={setType}
            title={"Тип"}
            value={type}
            maxLength={100}
            hasError={!type}
          />
          <CourtSelector
            title="Корт"
            value={courtId}
            onChangeFunction={(id) => {
              setCourtId(id);
            }}
            hasError={!courtId}
            courts={courts ?? []}
          />
          <EventStatusSelector
            title="Статус события"
            value={status}
            onChangeFunction={setStatus}
            hasError={status === null}
          />
          <RankSelector
            title="Минимальный ранг"
            value={rankMinInput}
            onChangeFunction={handleRankMinChange}
            hasError={rankMin === null || rankMinError}
          />
          <RankSelector
            title="Максимальный ранг"
            value={rankMaxInput}
            onChangeFunction={handleRankMaxChange}
            hasError={rankMax === null || rankMaxError}
          />
          <Input
            title={"Стоимость участия"}
            value={priceInput}
            maxLength={10}
            placeholder={"0"}
            hasError={price === null}
            onChangeFunction={(raw) => {
              const sanitized = raw.replace(/[^\d]/g, "");

              setPriceInput(sanitized);

              if (sanitized) {
                setPrice(parseInt(sanitized));
              } else {
                setPrice(0);
              }
            }}
            onBlur={() => {
              if (priceInput && /^\d+$/.test(priceInput)) {
                const num = parseInt(priceInput);
                setPrice(num);
                setPriceInput(String(num));
              } else {
                setPrice(0);
                setPriceInput("");
              }
            }}
          />
          <div className="flex flex-col gap-[8px]">
            <p className="text-[15px] font-semibold text-[#A4A9B4] ml-2">
              Максимальное количество участников
            </p>
            <PlayerCountSelector
              selectedCount={maxUsers}
              onCountChange={setMaxUsers}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col fixed bottom-[80px]  right-0 left-0 gap-4 w-full">
        <Button
          disabled={isUpdatingEvent}
          onClick={() => {
            if (isFormValid()) {
              handleUpdateTournament();
            }
          }}
          className={
            !isFormValid() ? "bg-[#F8F8FA] text-[#A4A9B4]" : " mx-auto"
          }
        >
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};
