import React from "react"
import { Spinner } from "./Spinner"
import { cn } from "@/lib/utils"

interface GreenButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  children: React.ReactNode
  className?: string
  buttonClassName?: string
}

export default function GreenButton({
  onClick,
  disabled = false,
  isLoading = false,
  children,
  className = "",
  buttonClassName = "",
}: GreenButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        `py-3 px-6 rounded-xl font-semibold text-white transition-colors duration-200 relative pressable ${
          !disabled && !isLoading
            ? cn("bg-green", buttonClassName)
            : "bg-gray-400 cursor-not-allowed"
        }`,
        className
      )}
    >
      <span
        className={`transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 animate-fadeIn">
          <Spinner size="md" className="text-green-500" />
        </span>
      )}
    </button>
  )
}
