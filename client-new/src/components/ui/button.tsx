import { twMerge } from "tailwind-merge";

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}
export const Button = ({ className, onClick, children }: ButtonProps) => {
  // const variants = {
  //   active: "",
  //   disabled: "",
  // };

  return (
    <div
      className={twMerge(
        "text-[17px] w-fit bg-[#AFFF3F]  text-black py-[18px] px-[30px] rounded-[30px]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
