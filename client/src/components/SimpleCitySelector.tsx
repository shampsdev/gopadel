import React, { useState, useRef, useEffect } from "react"
import { russianCities } from "@/data/cities"

interface SimpleCitySelectorProps {
  value: string
  onChange: (value: string) => void
  title: string
}

const SimpleCitySelector: React.FC<SimpleCitySelectorProps> = ({
  value,
  onChange,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredCities = searchTerm
    ? russianCities.filter((city) =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : russianCities

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen)
    setSearchTerm("")
  }

  const handleCitySelect = (cityName: string) => {
    onChange(cityName)
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <fieldset
        className={`border-2 rounded-xl px-3 relative transition-all duration-100 
          ${
            !value
              ? "border-[#E53935] text-[#E53935]"
              : "border-gray-300 text-gray-400 focus-within:border-[#20C86E] focus-within:text-[#20C86E]"
          } 
          `}
      >
        <legend className="px-2 text-[15px] font-semibold transition-all duration-100">
          {title}
        </legend>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md bg-transparent px-3 pb-3 pt-1 text-sm focus:outline-none"
          onClick={handleToggleDropdown}
        >
          {value ? (
            <span className="text-main">{value}</span>
          ) : (
            <span className="text-gray-400">Выберите город</span>
          )}
          <svg
            className="ml-2 h-4 w-4 opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m7 15 5 5 5-5" />
            <path d="m7 9 5-5 5 5" />
          </svg>
        </button>
      </fieldset>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="border-b px-3 py-2">
            <input
              ref={searchInputRef}
              className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-gray-400"
              placeholder="Поиск города..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-auto p-1">
            {filteredCities.length === 0 ? (
              <div className="py-6 text-center text-sm">Город не найден</div>
            ) : (
              filteredCities.map((city) => (
                <div
                  key={city}
                  className="flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="mr-2 h-4 w-4 shrink-0">
                    {value === city && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  {city}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleCitySelector
