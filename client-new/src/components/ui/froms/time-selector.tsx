import { useState } from "react";

interface TimeSelectorProps {
  title: string;
  value: string;
  onChangeFunction: (value: string) => void;
  hasError?: boolean;
}

export const TimeSelector = ({
  title,
  value,
  onChangeFunction,
  hasError = false,
}: TimeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Генерируем варианты времени с интервалом 30 минут
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourStr = hour.toString().padStart(2, "0");
        const minuteStr = minute.toString().padStart(2, "0");
        options.push(`${hourStr}:${minuteStr}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <section className="relative">
      <fieldset
        className={`border-2 rounded-[14px] px-3 relative transition-all cursor-pointer
          ${
            hasError
              ? "border-red-500 text-red-500 focus-within:border-red-600 focus-within:text-red-600"
              : "border-[#EBEDF0] text-[#A4A9B4] focus-within:border-[#000] focus-within:text-[#000]"
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <legend className="px-2 text-[15px] font-semibold transition-all duration-100">
          {title}
        </legend>
        <div className="flex justify-between items-center pb-[12px] py-[3px] px-[16px]">
          <span className={value ? "text-black" : "text-[#A4A9B4]"}>
            {value || "Выберите время"}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </fieldset>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#EBEDF0] rounded-[14px] mt-1 z-10 shadow-lg max-h-48 overflow-y-auto">
          {timeOptions.map((time) => (
            <div
              key={time}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[16px]"
              onClick={() => {
                onChangeFunction(time);
                setIsOpen(false);
              }}
            >
              {time}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
