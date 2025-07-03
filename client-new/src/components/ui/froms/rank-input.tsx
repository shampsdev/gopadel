import { useState, useRef, useEffect } from "react";
import { ranks } from "../../../shared/constants/ranking";

interface RankInputProps {
  title: string;
  value: string;
  onChangeFunction: (value: string) => void;
  maxLength?: number;
  hasError?: boolean;
}

export const RankInput = ({
  title,
  value,
  onChangeFunction,
  maxLength,
  hasError = false,
}: RankInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredRanks, setFilteredRanks] = useState<typeof ranks>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value.length > 0 && isFocused) {
      const filtered = ranks.filter(
        (rank) =>
          rank.title.toLowerCase().includes(value.toLowerCase()) ||
          rank.from.toString().includes(value) ||
          rank.to.toString().includes(value) ||
          Math.floor(rank.from).toString().includes(value) ||
          Math.floor(rank.to).toString().includes(value)
      );
      setFilteredRanks(filtered.slice(0, 6));
      setShowSuggestions(filtered.length > 0);
    } else if (isFocused) {
      setFilteredRanks(ranks.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setFilteredRanks([]);
      setShowSuggestions(false);
    }
  }, [value, isFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRankSelect = (rank: (typeof ranks)[0]) => {
    onChangeFunction(rank.title);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  return (
    <section className="relative">
      <fieldset
        className={`border-2 rounded-[14px] px-3 relative transition-all 
          ${
            hasError
              ? "border-red-500 text-red-500 focus-within:border-red-600 focus-within:text-red-600"
              : "border-[#EBEDF0] text-[#A4A9B4] focus-within:border-[#000] focus-within:text-[#000]"
          }`}
      >
        <legend className="px-2 text-[15px] font-semibold transition-all duration-100">
          {title}
        </legend>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChangeFunction(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (value && filteredRanks.length > 0) {
              setShowSuggestions(true);
            } else {
              setFilteredRanks(ranks.slice(0, 6));
              setShowSuggestions(true);
            }
          }}
          maxLength={maxLength}
          className="w-full text-black outline-none pb-[12px] py-[3px] px-[16px] bg-transparent"
          placeholder="Выберите ранг"
        />
      </fieldset>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border-2 border-[#EBEDF0] rounded-[14px] mt-1 max-h-48 overflow-y-auto z-10 shadow-lg"
        >
          {filteredRanks.map((rank, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[16px]"
              onClick={() => handleRankSelect(rank)}
            >
              {rank.title} ({rank.from.toFixed(1)}-{rank.to.toFixed(1)})
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
