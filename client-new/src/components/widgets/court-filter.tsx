import { useState, useRef, useEffect } from "react";
import type { Court } from "../../types/court.type";

interface CourtFilterProps {
  courts: Court[];
  selectedCourtId: string | null;
  onCourtChange: (courtId: string | null) => void;
  placeholder?: string;
}

export const CourtFilter = ({
  courts,
  selectedCourtId,
  onCourtChange,
  placeholder = "Начните вводить название клуба",
}: CourtFilterProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const selectedCourt = courts.find((court) => court.id === selectedCourtId);

  useEffect(() => {
    if (selectedCourt) {
      setSearchValue(selectedCourt.name);
    } else {
      setSearchValue("");
    }
  }, [selectedCourt]);

  useEffect(() => {
    if (searchValue && searchValue.length > 0 && isFocused) {
      const filtered = courts.filter(
        (court) =>
          court.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          court.address.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCourts(filtered.slice(0, 10));
      setShowSuggestions(filtered.length > 0);
    } else if (isFocused && searchValue.length === 0) {
      // Показываем все корты, если поле пустое и в фокусе
      setFilteredCourts(courts.slice(0, 10));
      setShowSuggestions(courts.length > 0);
    } else {
      setFilteredCourts([]);
      setShowSuggestions(false);
    }
  }, [searchValue, isFocused, courts]);

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
        // Восстанавливаем название выбранного корта, если поле пустое
        if (selectedCourt && searchValue === "") {
          setSearchValue(selectedCourt.name);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedCourt, searchValue]);

  const handleCourtSelect = (court: Court) => {
    onCourtChange(court.id);
    setSearchValue(court.name);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  const handleClear = () => {
    onCourtChange(null);
    setSearchValue("");
    setShowSuggestions(false);
    setIsFocused(false);
  };

  return (
    <section className="relative w-full">
      <div className="flex flex-row items-center gap-2 bg-white border-2 border-[#EBEDF0] rounded-[18px] px-4 py-3 focus-within:border-[#000] transition-all">
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (courts.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="flex-1 outline-none text-[14px] text-black bg-transparent placeholder-[#A4A9B4]"
        />
        {selectedCourtId && (
          <button
            onClick={handleClear}
            className="text-[#A4A9B4] hover:text-[#000] transition-colors"
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {showSuggestions && filteredCourts.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border-2 border-[#EBEDF0] rounded-[14px] mt-1 max-h-64 overflow-y-auto z-50 shadow-lg"
        >
          {filteredCourts.map((court) => (
            <div
              key={court.id}
              className={`px-4 py-3 hover:bg-gray-100 cursor-pointer text-[14px] transition-colors ${
                selectedCourtId === court.id ? "bg-gray-50" : ""
              }`}
              onClick={() => handleCourtSelect(court)}
            >
              <div className="font-medium text-black">{court.name}</div>
              <div className="text-[#5D6674] text-[12px] mt-1">
                {court.address}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

