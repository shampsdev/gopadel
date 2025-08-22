import { twMerge } from "tailwind-merge";
import { useMemo } from "react";

interface DateItemProps {
  day: number;
  month: string;
  weekday: string;
  onClick: () => void;
  variant: "active" | "default";
}

const DateItem = ({
  day,
  month,
  weekday,
  onClick,
  variant = "default",
}: DateItemProps) => {
  const variants = {
    active: "bg-[#AFFF3F] text-black",
    default: "bg-[#F8F8FA] text-[#868D98]",
  };

  return (
    <div
      onClick={onClick}
      className={twMerge(
        "flex flex-col gap-[1px] text-black items-center justify-center px-[10px] py-[8px] rounded-[12px] cursor-pointer flex-1",
        variants[variant]
      )}
    >
      <p className="text-[18px] font-medium">{day}</p>
      <div className="flex flex-col items-center">
        <p className="text-[12px]">{month}</p>
        <p className="text-[12px]">{weekday}</p>
      </div>
    </div>
  );
};

interface DateSelectorProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  className?: string;
}

export const DateSelector = ({
  selectedDate,
  onDateChange,
  className,
}: DateSelectorProps) => {
  // Генерируем массив дат: если есть выбранная дата - 2 дня до, выбранная, 2 дня после
  // Если нет - сегодня и 4 дня после
  const dates = useMemo(() => {
    const result: Date[] = [];
    const today = new Date();

    if (selectedDate) {
      // Если есть выбранная дата, показываем её и по 2 дня до и после
      const centerDate = new Date(selectedDate);

      // 2 дня до выбранной даты
      for (let i = 2; i > 0; i--) {
        const prevDate = new Date(centerDate);
        prevDate.setDate(centerDate.getDate() - i);
        result.push(prevDate);
      }

      // Выбранная дата
      result.push(centerDate);

      // 2 дня после выбранной даты
      for (let i = 1; i <= 2; i++) {
        const nextDate = new Date(centerDate);
        nextDate.setDate(centerDate.getDate() + i);
        result.push(nextDate);
      }
    } else {
      // Если нет выбранной даты, показываем сегодня и 4 дня после
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        result.push(date);
      }
    }

    return result;
  }, [selectedDate]);

  const formatMonth = (date: Date): string => {
    const months = [
      "янв",
      "фев",
      "мар",
      "апр",
      "май",
      "июн",
      "июл",
      "авг",
      "сен",
      "окт",
      "ноя",
      "дек",
    ];
    return months[date.getMonth()];
  };

  const formatWeekday = (date: Date): string => {
    const weekdays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    return weekdays[date.getDay()];
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div
      className={twMerge(
        "flex flex-row w-full gap-3 justify-center flex-wrap",
        className
      )}
    >
      {dates.map((date, index) => (
        <DateItem
          key={index}
          day={date.getDate()}
          month={formatMonth(date)}
          weekday={formatWeekday(date)}
          onClick={() => onDateChange(date)}
          variant={isDateSelected(date) ? "active" : "default"}
        />
      ))}
    </div>
  );
};
