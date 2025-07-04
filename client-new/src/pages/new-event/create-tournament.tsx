import { useState } from "react";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { Input } from "../../components/ui/froms/input";
import {
  formatDateInput,
  parseDateToISO,
  validateDateFormat,
  formatTimeInput,
  validateTimeFormat,
  createStartAndEndTime,
  formatISODateToMoscow,
} from "../../utils/date-format";
import { Button } from "../../components/ui/button";
import { RankSelector } from "../../components/ui/froms/rank-selector";
import { ranks } from "../../shared/constants/ranking";

export const CreateTournament = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const [title, setTitle] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [dateISO, setDateISO] = useState<string | null>(null);
  const [dateError, setDateError] = useState<boolean>(true);

  const [time, setTime] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<boolean>(true);
  const [clubName, setClubName] = useState<string | null>(null);
  const [clubAddress, setClubAddress] = useState<string | null>(null);

  const [type, setType] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [rankInput, setRankInput] = useState<string>("");

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

  // Проверяем валидность всех обязательных полей
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
      rank !== null &&
      rank > 0 &&
      price !== null &&
      price > 0 &&
      maxUsers !== null &&
      maxUsers > 0
    );
  };

  const handleCreateTournament = () => {
    if (!date || !time) {
      console.log("Необходимо указать дату и время");
      return;
    }

    if (!validateDateFormat(date)) {
      console.log("Неверный формат даты");
      return;
    }

    if (!validateTimeFormat(time)) {
      console.log("Неверный формат времени");
      return;
    }

    const { startTime: start, endTime: end } = createStartAndEndTime(
      date,
      time
    );

    if (!start || !end) {
      console.log("Ошибка при создании времени начала и окончания");
      return;
    }

    setStartTime(start);
    setEndTime(end);

    const tournamentData = {
      title,
      startTime: start,
      endTime: end,
      clubName,
      clubAddress,
      type,
      rank,
      price,
      maxUsers,
    };

    console.log("Данные турнира:", tournamentData);
  };

  return (
    <div className="flex flex-col gap-[40px] h-[150vh]">
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
          <Input
            onChangeFunction={(value) => {
              const formatted = formatDateInput(value);
              setDate(formatted);

              if (validateDateFormat(formatted)) {
                const isoDate = parseDateToISO(formatted);
                setDateISO(isoDate);
                setDateError(false);
              } else {
                setDateISO(null);
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
            onChangeFunction={setClubName}
            title={"Место"}
            value={clubName ?? ""}
            maxLength={100}
            hasError={!clubName}
          />
          <Input
            onChangeFunction={setClubAddress}
            title={"Адрес"}
            value={clubAddress ?? ""}
            maxLength={240}
            hasError={!clubAddress}
          />
          <Input
            onChangeFunction={setType}
            title={"Тип"}
            value={type ?? ""}
            maxLength={100}
            hasError={!type}
          />
          <RankSelector
            title="Ранг"
            value={rankInput}
            onChangeFunction={handleRankChange}
            hasError={rank === null || rank === 0}
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
          onClick={handleCreateTournament}
          className={!isFormValid() ? "bg-[#F8F8FA] text-[#A4A9B4]" : ""}
        >
          Создать турнир
        </Button>
      </div>
    </div>
  );
};
