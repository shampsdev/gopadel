import { useState } from "react";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { Input } from "../../components/ui/froms/input";
import { Textarea } from "../../components/ui/froms/textarea";
import { CourtSelector } from "../../components/ui/froms/court-selector";
import { ClubSelector } from "../../components/ui/froms/club-selector";
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
import type { CreateTournament as CreateTournamentType } from "../../types/create-tournament";
import { useAuthStore } from "../../shared/stores/auth.store";
import { useGetCourts } from "../../api/hooks/useGetCourts";
import { useGetMyClubs } from "../../api/hooks/useGetMyClubs";
import { useCreateTournament } from "../../api/hooks/mutations/tournament/useCreateTournament";
import { useNavigate } from "react-router";
import { useIsAdmin } from "../../api/hooks/useIsAdmin";
import { Preloader } from "../../components/widgets/preloader";
import AboutImage from "../../assets/about.png";

export const CreateTournament = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState<boolean>(true);

  const [time, setTime] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<boolean>(true);

  const [type, setType] = useState<string | null>(null);
  const [courtId, setCourtId] = useState<string>("");
  const [clubId, setClubId] = useState<string>("");
  const [rank, setRank] = useState<number | null>(null);
  const [rankInput, setRankInput] = useState<string>("");

  const { data: courts = [], isLoading: courtsLoading } = useGetCourts();
  const { data: myClubs = [], isLoading: clubsLoading } = useGetMyClubs();

  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const { mutateAsync: createTournament, isPending: isCreatingTournament } =
    useCreateTournament();

  const handleRankChange = (rankTitle: string) => {
    setRankInput(rankTitle);
    const selectedRank = ranks.find((r) => r.title === rankTitle);
    if (selectedRank) {
      setRank(selectedRank.from);
    }
  };

  const [price, setPrice] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState<string>("");
  const [maxUsers, setMaxUsers] = useState<number | null>(null);
  const [maxUsersInput, setMaxUsersInput] = useState<string>("");

  const isFormValid = () => {
    return (
      title &&
      date &&
      time &&
      validateDateFormat(date) &&
      validateTimeFormat(time) &&
      type &&
      courtId &&
      clubId &&
      rank !== null &&
      rank >= 0 &&
      price !== null &&
      price >= 0 &&
      maxUsers !== null &&
      maxUsers > 0
    );
  };

  const handleCreateTournament = async () => {
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

    if (!clubId) {
      return;
    }

    const { startTime: start, endTime: end } = createStartAndEndTime(
      date,
      time
    );

    if (!start || !end) {
      return;
    }

    const tournamentData: CreateTournamentType = {
      courtId: courtId,
      clubId: clubId,
      description: description,
      endTime: end,
      maxUsers: maxUsers ?? 0,
      name: title ?? "",
      organizatorId: user?.id ?? "",
      price: price ?? 0,
      rankMax: ranks.find((r) => r.title === rankInput)?.to ?? 0,
      rankMin: ranks.find((r) => r.title === rankInput)?.from ?? 0,
      startTime: start,
      tournamentType: type ?? "",
    };

    try {
      const tournament = await createTournament(tournamentData);
      if (tournament?.id) {
        navigate(`/tournament/${tournament?.id}`);
      } else {
        alert("Турнир успешно создан");
        navigate("/");
      }
    } catch (error) {
      alert("Ошибка при создании турнира");
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
    <div className="flex flex-col gap-[40px] pb-[100px]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 px-[12px]">
          <p className="text-[24px] font-medium">Новый турнир</p>
          <p className="text-[#5D6674] text-[16px]">
            Добавьте информацию о событии
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Input
            onChangeFunction={setTitle}
            title={"Название"}
            value={title ?? ""}
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
              if (!validateDateFormat(date ?? "")) {
                setDateError(true);
              } else {
                setDateError(false);
              }
            }}
            title={"Дата"}
            value={date ?? ""}
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
              if (!validateTimeFormat(time ?? "")) {
                setTimeError(true);
              } else {
                setTimeError(false);
              }
            }}
            title={"Время"}
            value={time ?? ""}
            maxLength={11}
            placeholder={"чч:мм-чч:мм"}
            hasError={timeError}
          />

          <Input
            onChangeFunction={setType}
            title={"Тип"}
            value={type ?? ""}
            maxLength={100}
            hasError={!type}
          />
          <ClubSelector
            title="Клуб"
            value={clubId}
            onChangeFunction={(id) => {
              setClubId(id);
            }}
            hasError={!clubId}
            clubs={myClubs ?? []}
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
          <RankSelector
            title="Ранг"
            value={rankInput}
            onChangeFunction={handleRankChange}
            hasError={rank === null}
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
                setPrice(null);
              }
            }}
            onBlur={() => {
              // При потере фокуса форматируем число
              if (priceInput && /^\d+$/.test(priceInput)) {
                const num = parseInt(priceInput);
                setPrice(num);
                setPriceInput(String(num));
              } else {
                setPrice(null);
                setPriceInput("");
              }
            }}
          />
          <Input
            title={"Максимальное количество участников"}
            value={maxUsersInput}
            maxLength={3}
            placeholder={"0"}
            hasError={maxUsers === null}
            onChangeFunction={(raw) => {
              const sanitized = raw.replace(/[^\d]/g, "");

              setMaxUsersInput(sanitized);

              if (sanitized) {
                setMaxUsers(parseInt(sanitized));
              } else {
                setMaxUsers(null);
              }
            }}
            onBlur={() => {
              // При потере фокуса форматируем число
              if (maxUsersInput && /^\d+$/.test(maxUsersInput)) {
                const num = parseInt(maxUsersInput);
                setMaxUsers(num);
                setMaxUsersInput(String(num));
              } else {
                setMaxUsers(null);
                setMaxUsersInput("");
              }
            }}
          />
        </div>
      </div>

      <div className="mx-auto">
        <Button
          disabled={isCreatingTournament}
          onClick={() => {
            if (isFormValid()) {
              handleCreateTournament();
            }
          }}
          className={!isFormValid() ? "bg-[#F8F8FA] text-[#A4A9B4]" : ""}
        >
          Создать турнир
        </Button>
      </div>
    </div>
  );
};
