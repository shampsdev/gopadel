import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogHeaderProps {
  className?: string
  children: React.ReactNode
  showCloseButton?: boolean
  onClose?: () => void
}

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

interface DialogFooterProps {
  className?: string
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
  // Обработка нажатия ESC
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange?.(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-10 max-h-[90vh] w-full overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export const DialogContent: React.FC<DialogContentProps> = ({ className, children }) => {
  return (
    <div 
      className={cn(
        "mx-auto w-full max-w-lg rounded-lg border p-6 shadow-lg",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ 
  className, 
  children, 
  showCloseButton = true, 
  onClose 
}) => {
  return (
    <div className={cn("mb-4 relative", className)}>
      {children}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 rounded-full p-1 bg-zinc-800 border border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Закрыть</span>
        </button>
      )}
    </div>
  )
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ className, children }) => {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ className, children }) => {
  return (
    <div className={cn("flex justify-end space-x-2 mt-6", className)}>
      {children}
    </div>
  )
} 