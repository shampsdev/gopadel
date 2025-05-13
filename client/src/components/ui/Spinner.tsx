import { cn } from "../../lib/utils"
import { ImSpinner9 } from "react-icons/im"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <ImSpinner9
        className={cn("animate-spin text-green-500", sizeClasses[size])}
      />
    </div>
  )
}
