import React from "react"
import { Spinner } from "./Spinner"

interface GreenButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  children: React.ReactNode
  className?: string
}

export default function GreenButton({
  onClick,
  disabled = false,
  isLoading = false,
  children,
  className = "",
}: GreenButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`py-3 px-6 rounded-xl font-semibold text-white transition-colors relative pressable ${
        !disabled && !isLoading
          ? "bg-green hover:bg-green-dark active:bg-green-dark"
          : "bg-gray-400 cursor-not-allowed"
      } ${className}`}
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
