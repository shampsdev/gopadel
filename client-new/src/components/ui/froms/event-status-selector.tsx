import { useState } from "react";
import { EventStatus } from "../../../types/event-status.type";

interface EventStatusSelectorProps {
  title: string;
  value: EventStatus | null;
  onChangeFunction: (value: EventStatus) => void;
  hasError?: boolean;
}

const statusOptions: {
  value: EventStatus;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}[] = [
  {
    value: EventStatus.registration,
    label: "Регистрация",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    description: "Открыта регистрация участников",
  },
  {
    value: EventStatus.full,
    label: "Заполнено",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    description: "Все места заняты",
  },
  {
    value: EventStatus.completed,
    label: "Завершено",
    color: "#10B981",
    bgColor: "#ECFDF5",
    description: "Событие успешно завершено",
  },
  {
    value: EventStatus.cancelled,
    label: "Отменено",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    description: "Событие отменено",
  },
];

export const EventStatusSelector = ({
  title,
  value,
  onChangeFunction,
  hasError = false,
}: EventStatusSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = statusOptions.find((option) => option.value === value);

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
          <div className="flex items-center gap-3">
            {selectedOption && (
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: selectedOption.color }}
              />
            )}
            <span className={selectedOption ? "text-black" : "text-[#A4A9B4]"}>
              {selectedOption ? selectedOption.label : "Выберите статус"}
            </span>
          </div>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
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
        <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#EBEDF0] rounded-[14px] mt-1 z-10 shadow-lg overflow-hidden">
          {statusOptions.map((option, index) => (
            <div
              key={option.value}
              className={`px-4 py-3 hover:bg-opacity-50 cursor-pointer transition-all duration-150 ${
                index !== statusOptions.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
              style={{
                backgroundColor:
                  value === option.value ? option.bgColor : "transparent",
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.backgroundColor = option.bgColor;
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
              onClick={() => {
                onChangeFunction(option.value);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shadow-sm transition-all duration-150"
                  style={{ backgroundColor: option.color }}
                />
                <div className="flex-1">
                  <div className="text-[16px] font-medium text-black">
                    {option.label}
                  </div>
                  <div className="text-[14px] text-[#868D98] mt-1">
                    {option.description}
                  </div>
                </div>
                {value === option.value && (
                  <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
