import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Icons } from "../../../../assets/icons";
import { useTelegramBackButton } from "../../../../shared/hooks/useTelegramBackButton";
import { Button } from "../../../../components/ui/button";
import { useCreateTournamentStore } from "../../../../shared/stores/create-tournament.store";

interface Day {
  date: number;
  month: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
}

export const CreateTournamentCalendar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const { selectedDate, setDateFromCalendar } = useCreateTournamentStore();

  const [currentDate, setCurrentDate] = useState<Date>(
    selectedDate || new Date()
  );
  const [days, setDays] = useState<Day[]>([]);

  // Дни недели
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  // Названия месяцев
  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  // Функция для генерации дней календаря
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Первый день месяца
    const firstDayOfMonth = new Date(year, month, 1);
    // Последний день месяца
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Получаем день недели для первого дня месяца (0 - воскресенье, 1 - понедельник, ...)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    // Преобразуем к формату, где понедельник - 0, воскресенье - 6
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const daysInMonth = lastDayOfMonth.getDate();

    // Дни предыдущего месяца
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    // Массив дней для отображения
    const calendarDays: Day[] = [];

    // Добавляем дни предыдущего месяца
    for (
      let i = prevMonthDays - daysFromPrevMonth + 1;
      i <= prevMonthDays;
      i++
    ) {
      calendarDays.push({
        date: i,
        month: month - 1,
        isCurrentMonth: false,
        isSelected: false,
      });
    }

    // Добавляем дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDay = new Date(year, month, i);
      const isSelected = selectedDate
        ? currentDay.getDate() === selectedDate.getDate() &&
          currentDay.getMonth() === selectedDate.getMonth() &&
          currentDay.getFullYear() === selectedDate.getFullYear()
        : false;

      calendarDays.push({
        date: i,
        month,
        isCurrentMonth: true,
        isSelected,
      });
    }

    // Добавляем дни следующего месяца для заполнения сетки
    const totalDaysToShow =
      Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;
    const daysFromNextMonth = totalDaysToShow - calendarDays.length;

    for (let i = 1; i <= daysFromNextMonth; i++) {
      calendarDays.push({
        date: i,
        month: month + 1,
        isCurrentMonth: false,
        isSelected: false,
      });
    }

    return calendarDays;
  };

  // Обновляем календарь при изменении текущей даты
  useEffect(() => {
    setDays(generateCalendarDays(currentDate));
  }, [currentDate, selectedDate]);

  // Функция для переключения на предыдущий месяц
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Функция для переключения на следующий месяц
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Функция для выбора даты
  const selectDate = (day: Day) => {
    const newDate = new Date(currentDate.getFullYear(), day.month, day.date);

    // Обновляем выбранную дату в store
    setDateFromCalendar(newDate);

    // Обновляем дни календаря
    setDays(
      days.map((d) => ({
        ...d,
        isSelected: d.date === day.date && d.month === day.month,
      }))
    );
  };

  // Форматирование даты для отображения
  const formatSelectedDate = () => {
    if (!selectedDate) return "";

    return `${selectedDate.getDate()} ${monthNames[
      selectedDate.getMonth()
    ].toLowerCase()}, ${weekDays[
      selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1
    ].toLowerCase()}`;
  };

  useEffect(() => {
    console.log(selectedDate);
  }, [selectedDate]);

  return (
    <div className="flex flex-col gap-[40px] pb-[200px]">
      <div className="flex flex-col gap-6">
        {/* Заголовок с кнопками навигации */}
        <div className="flex flex-row justify-between px-[8px] items-center">
          <Link to={`/new-event/tournament/year-month-pick`}>
            <p className="text-[24px] font-medium">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
          </Link>
          <div className="flex flex-row gap-[7px]">
            <div
              className="rotate-180 cursor-pointer"
              onClick={goToPreviousMonth}
            >
              {Icons.ArrowRight("#A4A9B4", "32", "32")}
            </div>
            <div className="cursor-pointer" onClick={goToNextMonth}>
              {Icons.ArrowRight("#A4A9B4", "32", "32")}
            </div>
          </div>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 text-center text-[#868D98] font-medium">
          {weekDays.map((day, index) => (
            <div key={index} className="py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Сетка календаря */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center text-center rounded-full cursor-pointer
                ${!day.isCurrentMonth ? "text-[#A4A9B4]" : ""}
                ${day.isSelected ? "bg-[#CDFF45] text-black" : ""}
              `}
              onClick={() => selectDate(day)}
            >
              {day.date}
            </div>
          ))}
        </div>

        <div className="flex flex-row gap-[8px] px-[8px] mt-[24px] items-end justify-end w-full">
          {selectedDate && (
            <div className="text-[16px] items-center justify-center rounded-[30px] py-[17px] bg-[#F8F8FA] flex-1">
              <div className="mx-auto text-center text-[#5D6674] text-[16px]">
                {formatSelectedDate()}
              </div>
            </div>
          )}
          <Button onClick={() => navigate(-1)}>
            <p>Готово</p>
          </Button>
        </div>
      </div>
    </div>
  );
};
