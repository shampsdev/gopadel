import { useState } from "react";
import type { Prize } from "../../../types/prize.type";

interface PrizeSelectorProps {
  title: string;
  value: Prize | null;
  hasError?: boolean;
  functions: [
    (userId: string) => void,
    (userId: string) => void,
    (userId: string) => void
  ];
  userId: string;
  onClear?: (userId: string) => void;
}

const PrizeOptions: { value: Prize | null; label: string }[] = [
  { value: null, label: "-" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
];

export const PrizeSelector = ({
  title,
  value,
  functions,
  userId,
  hasError = false,
  onClear,
}: PrizeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = PrizeOptions.find((option) => option.value === value);

  const handleOptionClick = (option: {
    value: Prize | null;
    label: string;
  }) => {
    if (option.value !== null) {
      functions[option.value - 1](userId);
    } else if (onClear) {
      onClear(userId);
    }
    setIsOpen(false);
  };

  return (
    <section className="relative">
      <fieldset
        className={`border-2 rounded-[14px] w-[80px] px-3 relative transition-all cursor-pointer
          ${
            hasError
              ? "border-red-500 text-red-500 focus-within:border-red-600 focus-within:text-red-600"
              : "border-[#EBEDF0] text-[#A4A9B4] focus-within:border-[#000] focus-within:text-[#000]"
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <legend className="px-2 text-[12px] font-semibold transition-all duration-100">
          {title}
        </legend>
        <div className="flex justify-between items-center px-[12px] py-[10px] text-[14px]">
          <span className={selectedOption ? "text-black" : "text-[#868D98]"}>
            {selectedOption ? selectedOption.label : "-"}
          </span>
          <svg
            className={`w-[16px] h-[16px] transition-transform ${
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
        <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#EBEDF0] rounded-[14px] mt-1 z-10 shadow-lg">
          {PrizeOptions.map((option) => (
            <div
              key={option.value || "none"}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[16px]"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
