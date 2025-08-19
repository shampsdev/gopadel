import { useState } from "react";
import type { Court } from "../../../types/court.type";
import { Icons } from "../../../assets/icons";

interface CourtSelectorProps {
  title: string;
  value: string;
  onChangeFunction: (value: string) => void;
  hasError?: boolean;
  courts: Court[];
}

export const CourtSelector = ({
  title,
  value,
  onChangeFunction,
  hasError = false,
  courts,
}: CourtSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCourt = courts.find((court) => court.id === value);

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
        <legend className="px-2 text-[15px] font-semibold transition-all duration-100 flex flex-row gap-[2px]">
          <p>{title}</p>
          <div className="mt-[4px]">{Icons.RequiredFieldStar()}</div>
        </legend>
        <div className="flex justify-between items-center pb-[12px] py-[3px] px-[16px]">
          <span className={selectedCourt ? "text-black" : "text-[#A4A9B4]"}>
            {selectedCourt ? selectedCourt.name : "Выберите корт"}
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
          {courts.map((court) => (
            <div
              key={court.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[16px]"
              onClick={() => {
                onChangeFunction(court.id);
                setIsOpen(false);
              }}
            >
              {court.name} ({court.address})
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
