import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

interface SelectValueProps {
  placeholder?: string
  children?: React.ReactNode
}

interface SelectContentProps {
  className?: string
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}>({
  isOpen: false,
  setIsOpen: () => {},
  triggerRef: { current: null },
})

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  // Закрытие при клике вне
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        const target = event.target as Element
        // Проверяем, что клик не был по элементу списка
        if (!target.closest('[data-select-content]')) {
          setIsOpen(false)
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, triggerRef }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ className, children }) => {
  const { isOpen, setIsOpen, triggerRef } = React.useContext(SelectContext)

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
    </button>
  )
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, children }) => {
  const { value } = React.useContext(SelectContext)
  
  // Если есть children и value, показываем children
  if (children && value) {
    return <span>{children}</span>
  }
  
  // Иначе показываем value или placeholder
  return <span>{value || placeholder}</span>
}

export const SelectContent: React.FC<SelectContentProps> = ({ className, children }) => {
  const { isOpen, triggerRef } = React.useContext(SelectContext)

  if (!isOpen || !triggerRef.current) return null

  // Получаем позицию и размеры trigger элемента
  const rect = triggerRef.current.getBoundingClientRect()
  const scrollY = window.scrollY || document.documentElement.scrollTop

  const contentStyle: React.CSSProperties = {
    position: 'fixed',
    top: rect.bottom + scrollY + 4, // 4px отступ
    left: rect.left,
    width: rect.width,
    zIndex: 9999,
  }

  return createPortal(
    <div 
      data-select-content
      style={contentStyle}
      className={cn(
        "rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-y-auto",
        className
      )}
    >
      {children}
    </div>,
    document.body
  )
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext)

  return (
    <div
      onClick={() => {
        onValueChange?.(value)
        setIsOpen(false)
      }}
      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-zinc-700 hover:text-white text-white"
    >
      {children}
    </div>
  )
} 