import React from "react"
import { PlayingPosition } from "@/types/user"

interface PlayingPositionSelectorProps {
  value: PlayingPosition | null
  onChange: (value: PlayingPosition | null) => void
  title: string
  optional?: boolean
}

const PlayingPositionSelector: React.FC<PlayingPositionSelectorProps> = ({
  value,
  onChange,
  title,
  optional = false,
}) => {
  const isEmpty = !value

  const options = [
    { value: "right" as PlayingPosition, label: "В правом" },
    { value: "left" as PlayingPosition, label: "В левом" },
    { value: "both" as PlayingPosition, label: "В обоих" },
  ]

  const getSelectBorderColor = () => {
    if (isEmpty && optional) {
      return "border-gray-300 text-gray-400 focus-within:border-[#20C86E] focus-within:text-[#20C86E]"
    }
    if (isEmpty) return "border-[#E53935] text-[#E53935]"
    return "border-gray-300 text-gray-400 focus-within:border-[#20C86E] focus-within:text-[#20C86E]"
  }

  return (
    <section>
      <fieldset
        className={`border-2 rounded-xl px-3 relative transition-all duration-100 
          ${getSelectBorderColor()}`}
      >
        <legend className="px-2 text-[15px] font-semibold transition-all duration-100">
          {title}
        </legend>
        <div className="relative">
          <select
            value={value || ""}
            onChange={(e) => {
              const selectedValue = e.target.value as PlayingPosition
              onChange(selectedValue || null)
            }}
            className="w-full text-main outline-none pb-[12px] py-[3px] px-[16px] bg-transparent appearance-none cursor-pointer pr-8"
          >
            <option value="" disabled>
              Выберите квадрат игры
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
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
        </div>
      </fieldset>
    </section>
  )
}

export default PlayingPositionSelector
