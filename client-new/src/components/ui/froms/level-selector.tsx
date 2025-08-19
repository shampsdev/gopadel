import { twMerge } from "tailwind-merge";
import { ranks } from "../../../shared/constants/ranking";

interface LevelSelectorProps {
  title: string;
  minValue: number | null;
  maxValue: number | null;
  onChangeMinValue: (value: number) => void;
  onChangeMaxValue: (value: number) => void;
  hasError?: boolean;
}

export const LevelSelector = ({
  title,
  minValue,
  maxValue,
  onChangeMinValue,
  onChangeMaxValue,
  hasError = false,
}: LevelSelectorProps) => {
  // Находим текущие выбранные ранги
  const minRank = ranks.find((r) => r.from === minValue);
  const maxRank = ranks.find((r) => r.from === maxValue);

  const displayText =
    minRank && maxRank
      ? minRank === maxRank
        ? minRank.title
        : `${minRank.title} - ${maxRank.title}`
      : "Выберите уровень";

  // Функция обработки клика по уровню
  const handleLevelClick = (rank: (typeof ranks)[0]) => {
    if (minValue === null || maxValue === null) {
      // Если ничего не выбрано, устанавливаем как мин и макс
      onChangeMinValue(rank.from);
      onChangeMaxValue(rank.from);
    } else if (rank.from < minValue) {
      // Если меньше текущего минимума, устанавливаем как новый минимум
      onChangeMinValue(rank.from);
    } else if (rank.from > maxValue) {
      // Если больше текущего максимума, устанавливаем как новый максимум
      onChangeMaxValue(rank.from);
    } else if (rank.from === minValue && rank.from === maxValue) {
      // Если это единственный выбранный элемент, снимаем выбор
      onChangeMinValue(0);
      onChangeMaxValue(0);
    } else if (rank.from === minValue) {
      // Если это минимальное значение, увеличиваем минимум
      const nextRank = ranks.find(
        (r) => r.from > rank.from && r.from <= maxValue
      );
      if (nextRank) {
        onChangeMinValue(nextRank.from);
      }
    } else if (rank.from === maxValue) {
      // Если это максимальное значение, уменьшаем максимум
      const prevRank = ranks.find(
        (r) => r.from < rank.from && r.from >= minValue
      );
      if (prevRank) {
        onChangeMaxValue(prevRank.from);
      }
    } else {
      // Иначе устанавливаем как единственное значение (и мин и макс)
      onChangeMinValue(rank.from);
      onChangeMaxValue(rank.from);
    }
  };

  return (
    <div>
      {/* Верхняя часть с заголовком и значением */}
      <div
        className={`rounded-[14px] ${
          hasError ? "border-red-500" : "border-[#EBEDF0]"
        }`}
      >
        <div className="px-[20px] py-[16px]">
          <div className="text-[#A4A9B4] text-[15px]">{title}</div>
        </div>
      </div>

      {/* Список уровней */}
      <div className="pl-4">
        {ranks.map((rank, index) => {
          const isSelected =
            minValue !== null &&
            maxValue !== null &&
            rank.from >= minValue &&
            rank.from <= maxValue;

          // Определяем, нужно ли рисовать линию после текущего элемента
          const showLine = index < ranks.length - 1;

          // Определяем, активна ли линия (находится между min и max)
          const isLineActive =
            showLine &&
            minValue !== null &&
            maxValue !== null &&
            rank.from >= minValue &&
            ranks[index + 1].from <= maxValue;

          return (
            <div key={rank.title}>
              <div
                className="flex items-center cursor-pointer h-[18px]"
                onClick={() => handleLevelClick(rank)}
              >
                <div
                  className={twMerge(
                    "w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors",
                    isSelected ? "bg-[#AFFF3F]" : "bg-[#EBEDF0]"
                  )}
                />
                <div className="ml-4">
                  <span className="text-[16px]">{rank.title} </span>
                  <span className="text-[#868D98] text-[14px]">
                    ({rank.from.toFixed(1)}-{rank.to.toFixed(1)})
                  </span>
                </div>
              </div>

              {/* Вертикальная линия между кружками */}
              {showLine && (
                <div className="flex">
                  <div
                    className={twMerge(
                      "w-[2px] h-[12px] mx-[8px] my-[4px] transition-colors",
                      isLineActive ? "bg-[#AFFF3F]" : "bg-[#EBEDF0]"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
