import { twMerge } from "tailwind-merge";

interface ButtonProps {
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}
export const Button = ({ className, onClick, children }: ButtonProps) => {
  return (
    <div className={twMerge(className, "")} onClick={onClick}>
      {children}
    </div>
  );
};
