import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { Input } from "../../components/ui/froms/input";
import { Textarea } from "../../components/ui/froms/textarea";
import { CourtSelector } from "../../components/ui/froms/court-selector";
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
import type { PatchTournament } from "../../types/patch-tournament";
import { useGetCourts } from "../../api/hooks/useGetCourts";
import { usePatchTournament } from "../../api/hooks/mutations/tournament/usePatchTournament";
import { useDeleteTournament } from "../../api/hooks/mutations/tournament/useDeleteTournament";
import { useIsAdmin } from "../../api/hooks/useIsAdmin";
import { Preloader } from "../../components/widgets/preloader";
import AboutImage from "../../assets/about.png";
import { useGetTournaments } from "../../api/hooks/useGetTournaments";
import { Icons } from "../../assets/icons";
import { useModalStore } from "../../shared/stores/modal.store";

export const TournamentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { openModal } = useModalStore();
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
  const [rank, setRank] = useState<number | null>(null);
  const [rankInput, setRankInput] = useState<string>("");

  const { data: courts = [], isLoading: courtsLoading } = useGetCourts();

  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const { mutateAsync: patchTournament, isPending: isUpdatingTournament } =
    usePatchTournament(id!);

  const { mutateAsync: deleteTournament, isPending: isDeletingTournament } =
    useDeleteTournament();

  const { data: tournaments, isLoading: tournamentLoading } = useGetTournaments(
    { id: id! }
  );
  const tournament = tournaments?.[0];

  useEffect(() => {
    if (tournament) {
      setTitle(tournament.name || "");
      setDescription(tournament.description || "");

      // Форматируем дату и время
      const startDate = new Date(tournament.startTime);
      const endDate = new Date(tournament.endTime);

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
      setClubName(tournament.court?.name || "");
      setClubAddress(tournament.court?.address || "");
      setType(tournament.tournamentType || "");
      setCourtId(tournament.court?.id || "");

      const min = Math.min(tournament.rankMin, tournament.rankMax);
      const max = Math.max(tournament.rankMin, tournament.rankMax);

      const selectedRank = ranks.find(
        (r) => Math.abs(r.from - min) < 0.01 && Math.abs(r.to - max) < 0.01
      );

      if (selectedRank) {
        setRankInput(selectedRank.title);
        setRank(selectedRank.from);
      } else {
        const fallbackRank = ranks.find(
          (r) => tournament.rankMin >= r.from && tournament.rankMax < r.to
        );
        if (fallbackRank) {
          setRankInput(fallbackRank.title);
          setRank(fallbackRank.from);
        }
      }

      setPrice(tournament.price);
      setPriceInput(tournament.price.toString());
      setMaxUsers(tournament.maxUsers);
      setMaxUsersInput(tournament.maxUsers.toString());
    }
  }, [tournament]);

  const handleRankChange = (rankTitle: string) => {
    setRankInput(rankTitle);
    const selectedRank = ranks.find((r) => r.title === rankTitle);
    if (selectedRank) {
      setRank(selectedRank.from);
    }
  };

  const [price, setPrice] = useState<number>(0);
  const [priceInput, setPriceInput] = useState<string>("");
  const [maxUsers, setMaxUsers] = useState<number>(0);
  const [maxUsersInput, setMaxUsersInput] = useState<string>("");

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
      rank !== null &&
      rank >= 0 &&
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

    const tournamentData: PatchTournament = {
      courtId: courtId,
      description: description,
      endTime: end,
      maxUsers: maxUsers,
      name: title,
      price: price,
      rankMax: ranks.find((r) => r.title === rankInput)?.from ?? 0,
      rankMin: ranks.find((r) => r.title === rankInput)?.to ?? 0,
      startTime: start,
      tournamentType: type,
    };

    try {
      await patchTournament(tournamentData);
      navigate(-1);
    } catch (error) {
      alert("Ошибка при обновлении турнира");
      console.error(error);
    }
  };

  const handleDeleteTournament = async () => {
    openModal({
      title: "Уверены, что хотите удалить событие?",
      subtitle: "Восстановить заполненную информацию будет невозможно",
      declineButtonText: "Отмена",
      acceptButtonText: "Удалить",
      declineButtonOnClick: () => {},
      acceptButtonOnClick: async () => {
        await deleteTournament(id!);
      },
    });
  };

  if (isAdminLoading || courtsLoading || tournamentLoading)
    return <Preloader />;

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

  if (!tournament) {
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
    <div className="flex flex-col gap-[40px] pb-[100px]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 px-[12px]">
          <p className="text-[24px] font-medium">Редактировать турнир</p>
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
                setPrice(0);
              }
            }}
            onBlur={() => {
              // При потере фокуса форматируем число
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
                setMaxUsers(0);
              }
            }}
            onBlur={() => {
              // При потере фокуса форматируем число
              if (maxUsersInput && /^\d+$/.test(maxUsersInput)) {
                const num = parseInt(maxUsersInput);
                setMaxUsers(num);
                setMaxUsersInput(String(num));
              } else {
                setMaxUsers(0);
                setMaxUsersInput("");
              }
            }}
          />
          <Button
            disabled={isDeletingTournament}
            onClick={handleDeleteTournament}
            className="w-full flex justify-between bg-[#f344387a] text-[#F34338]"
          >
            <div>Удалить турнир</div>
            <div>{Icons.Delete()}</div>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 mx-auto">
        <Button
          disabled={isUpdatingTournament}
          onClick={() => {
            if (isFormValid()) {
              handleUpdateTournament();
            }
          }}
          className={!isFormValid() ? "bg-[#F8F8FA] text-[#A4A9B4]" : ""}
        >
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};
