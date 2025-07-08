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
  return (
    <div
      className={twMerge(
        "text-[17px] w-fit bg-[#AFFF3F] text-black py-[18px] px-[30px] rounded-[30px] transition-colors cursor-pointer",
        disabled && "bg-gray-400 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {children}
    </div>
  );
};
