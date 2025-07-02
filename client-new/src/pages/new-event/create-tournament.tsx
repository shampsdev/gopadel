import { useState } from "react";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { Input } from "../../components/ui/froms/input";
import {
  formatDateInput,
  parseDateToISO,
  validateDateFormat,
} from "../../utils/date-format";

export const CreateTournament = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const [title, setTitle] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [dateISO, setDateISO] = useState<string | null>(null);

  const [time, setTime] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string | null>(null);
  const [clubAddress, setClubAddress] = useState<string | null>(null);

  const [type, setType] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(0);
  const [rankInput, setRankInput] = useState<string>("");

  const [price, setPrice] = useState<number | null>(0);
  const [maxUsers, setMaxUsers] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-[40px] h-[150vh]">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-2">
          <p>Новый турнир</p>
          <p>Добавьте информацию о событии</p>
        </div>

        <div className="flex flex-col gap-2">
          <Input
            onChangeFunction={setTitle}
            title={"Название"}
            value={title ?? ""}
            maxLength={100}
          />
          <Input
            onChangeFunction={(value) => {
              const formatted = formatDateInput(value);
              setDate(formatted);

              if (validateDateFormat(formatted)) {
                const isoDate = parseDateToISO(formatted);
                setDateISO(isoDate);
              } else {
                setDateISO(null);
              }
            }}
            title={"Дата (дд.мм.гг)"}
            value={date ?? ""}
            maxLength={8}
            placeholder={"дд.мм.гг"}
          />
          <Input
            onChangeFunction={setTime}
            title={"Время"}
            value={time ?? ""}
            maxLength={100}
          />
          <Input
            onChangeFunction={setClubName}
            title={"Место"}
            value={clubName ?? ""}
            maxLength={100}
          />
          <Input
            onChangeFunction={setClubAddress}
            title={"Адрес"}
            value={clubAddress ?? ""}
            maxLength={240}
          />
          <Input
            onChangeFunction={setType}
            title={"Тип"}
            value={type ?? ""}
            maxLength={100}
          />
          <Input
            title="Ранг"
            value={rankInput}
            maxLength={4}
            onChangeFunction={(raw) => {
              const sanitized = raw.replace(",", ".");

              if (!/^\d*\.?\d*$/.test(sanitized)) return;

              setRankInput(raw);

              if (/^\d+(\.\d+)?$/.test(sanitized)) {
                setRank(parseFloat(sanitized));
              } else {
                setRank(null);
              }
            }}
            onBlur={() => {
              const cleaned = rankInput.replace(",", ".").trim();

              if (/^\d+(\.\d+)?$/.test(cleaned)) {
                const num = parseFloat(cleaned);
                setRank(num);
                setRankInput(String(num));
              } else {
                setRank(null);
                setRankInput("");
              }
            }}
          />
          <Input
            title={"Стоимость участия"}
            value={`${price} ₽`}
            maxLength={100}
            onChangeFunction={(raw) => {
              const sanitized = raw.replace(",", ".");

              if (!/^\d*\.?\d*$/.test(sanitized)) return;

              setPrice(parseFloat(sanitized));
            }}
          />
          <Input
            title={"Максимальное количество участников"}
            value={`${maxUsers}`}
            maxLength={100}
            onChangeFunction={(raw) => {
              const sanitized = raw.replace(",", ".");

              if (!/^\d*$/.test(sanitized)) return;

              setMaxUsers(parseInt(sanitized));
            }}
          />
        </div>
      </div>

      <div>BUTTON</div>

      {/* Временная отладочная информация */}
      {dateISO && (
        <div className="text-xs text-gray-500 mt-4">ISO дата: {dateISO}</div>
      )}
    </div>
  );
};
