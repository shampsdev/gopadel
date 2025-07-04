import * as React from "react"
import { cn } from "../../lib/utils"

interface ScrollAreaProps {
  className?: string
  children: React.ReactNode
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ className, children }) => {
  return (
    <div className={cn("h-full w-full overflow-auto scrollbar-thin", className)}>
      {children}
    </div>
  )
} 