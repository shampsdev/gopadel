import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useTelegramBackButton } from "../../../../shared/hooks/useTelegramBackButton";
import { Button } from "../../../../components/ui/button";
import { useCreateTournamentStore } from "../../../../shared/stores/create-tournament.store";

export const CreateTournamentYearMonthPick = () => {
  const navigate = useNavigate();
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const { selectedDate, setDateFromCalendar } = useCreateTournamentStore();

  // Текущий год и месяц из выбранной даты или текущей даты
  const currentDate = selectedDate || new Date();
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth()
  );

  // Генерируем список годов (текущий год -2 и +7 лет вперед)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  // Ссылка на контейнер карусели годов
  const yearsCarouselRef = useRef<HTMLDivElement>(null);

  // Названия месяцев
  const monthNames = [
    "январь",
    "февраль",
    "март",
    "апрель",
    "май",
    "июнь",
    "июль",
    "август",
    "сентябрь",
    "октябрь",
    "ноябрь",
    "декабрь",
  ];

  // Обработчик выбора года
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);

    // Прокрутка карусели к выбранному году
    scrollToSelectedYear(year);
  };

  // Функция для прокрутки карусели к выбранному году
  const scrollToSelectedYear = (year: number) => {
    if (!yearsCarouselRef.current) return;

    const container = yearsCarouselRef.current;
    const yearElements = container.querySelectorAll(".year-item");
    const yearIndex = years.indexOf(year);

    if (yearIndex >= 0 && yearElements[yearIndex]) {
      const yearElement = yearElements[yearIndex] as HTMLElement;
      const containerWidth = container.offsetWidth;
      const yearElementWidth = yearElement.clientWidth;

      // Центрируем выбранный год в карусели
      const scrollPosition =
        yearElement.offsetLeft - containerWidth / 2 + yearElementWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  // Обработчик выбора месяца
  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
  };

  // Обработчик кнопки "Готово"
  const handleDone = () => {
    // Создаем новую дату с выбранным годом и месяцем, сохраняя текущий день
    const day = selectedDate ? selectedDate.getDate() : 1;
    const newDate = new Date(selectedYear, selectedMonth, day);

    // Обновляем дату в store
    setDateFromCalendar(newDate);

    // Возвращаемся на календарь
    navigate(-1);
  };

  // Прокручиваем к выбранному году при первом рендере
  useEffect(() => {
    // Небольшая задержка для гарантии, что компонент уже отрендерился
    const timer = setTimeout(() => {
      scrollToSelectedYear(selectedYear);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-[40px] pb-[200px]">
      <div className="flex flex-col gap-6">
        {/* Выбор года */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[15px] font-medium text-[#868D98] px-4">
            Выберите год
          </h2>

          <div
            ref={yearsCarouselRef}
            className="flex overflow-x-auto px-4 pb-2 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="flex space-x-6 px-8">
              {years.map((year) => (
                <div
                  key={year}
                  className={`year-item text-[24px] font-medium py-2 whitespace-nowrap ${
                    selectedYear === year ? "text-black" : "text-[#A4A9B4]"
                  }`}
                  onClick={() => handleYearSelect(year)}
                >
                  {year}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Выбор месяца */}
        <div className="flex flex-col gap-4 mt-4">
          <h2 className="text-[15px] font-medium text-[#868D98] px-4">
            Выберите месяц
          </h2>

          <div className="grid grid-cols-3 gap-[4px] px-4">
            {monthNames.map((month, index) => (
              <div
                key={index}
                className={`
                  py-4  text-center rounded-[12px] ${
                    selectedMonth === index
                      ? "bg-[#CDFF45] text-black"
                      : "bg-[#F8F8FA] text-black"
                  }
                `}
                onClick={() => handleMonthSelect(index)}
              >
                {month}
              </div>
            ))}
          </div>
        </div>

        {/* Отображение выбранной даты */}
        <div className="flex flex-row gap-[8px] px-[8px] mt-[24px] justify-end">
          <div className="text-[16px] items-center justify-center rounded-[30px] py-[17px] bg-[#F8F8FA] flex-1">
            <div className="mx-auto text-center text-[#5D6674] text-[16px]">
              {monthNames[selectedMonth]}, {selectedYear}
            </div>
          </div>
          <Button onClick={handleDone}>
            <p>Готово</p>
          </Button>
        </div>
      </div>
    </div>
  );
};
