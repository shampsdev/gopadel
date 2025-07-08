import { twMerge } from "tailwind-merge";

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}
export const Button = ({
  className,
  onClick,
  children,
  disabled = false,
}: ButtonProps) => {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={twMerge(
        "text-[17px] w-fit bg-[#AFFF3F] text-black py-[18px] px-[30px] rounded-[30px] transition-colors border-0 outline-none",
        "touch-manipulation select-none", // iOS-specific optimizations
        disabled && "bg-gray-400 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      onTouchStart={() => {}} // iOS touch fix
      disabled={disabled}
      style={{ 
        WebkitTapHighlightColor: 'transparent', // Remove iOS highlight
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {children}
    </button>
  );
};
