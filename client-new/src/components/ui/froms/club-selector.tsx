import { useState } from "react";
import type { Club } from "../../../types/club.type";
import { Icons } from "../../../assets/icons";

interface ClubSelectorProps {
  title: string;
  value: string;
  onChangeFunction: (value: string) => void;
  hasError?: boolean;
  clubs: Club[];
}

export const ClubSelector = ({
  title,
  value,
  onChangeFunction,
  hasError = false,
  clubs,
}: ClubSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedClub = clubs.find((club) => club.id === value);

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
          <span className={selectedClub ? "text-black" : "text-[#A4A9B4]"}>
            {selectedClub ? selectedClub.name : "Выберите клуб"}
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
          {clubs.map((club) => (
            <div
              key={club.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[16px]"
              onClick={() => {
                onChangeFunction(club.id);
                setIsOpen(false);
              }}
            >
              {club.name}
              {club.description && (
                <div className="text-sm text-gray-500 mt-1">
                  {club.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
