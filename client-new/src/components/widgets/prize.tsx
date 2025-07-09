import { twMerge } from "tailwind-merge";
import GoldMedal from "../../assets/gold-medal.png";
import SilverMedal from "../../assets/silver-medal.png";
import BronzeMedal from "../../assets/bronze-medal.png";

interface PrizeProps {
  variant: "default" | "first" | "second" | "third" | "not-finished";
  className?: string;
}
export const Prize = ({ className, variant = "default" }: PrizeProps) => {
  const variants = {
    default: "bg-[#F8F8FA] text-[#5D6674]",
    first: "bg-[#FFF8EC] text-[#FDB440]",
    second: "bg-[#F2F7FC] text-[#7CADE0]",
    third: "bg-[#FF646F] text-[#FF646F] ",
    "not-finished": "bg-[#F8F8FA] text-[#5D6674]",
  };

  if (variant === "first") {
    return (
      <div
        className={twMerge(
          "flex flex-row px-[20px] py-[16px] rounded-[30px] justify-between items-center",
          variants[variant],
          className
        )}
      >
        <div className="flex flex-row items-center gap-[12px]">
          <div className="w-[24px] h-[24px]  overflow-hidden">
            <img src={GoldMedal} alt="prize" />
          </div>
          <p className="font-medium text-[16px]">1 место</p>
        </div>
        <p className="text-[14px]">победитель</p>
      </div>
    );
  }

  if (variant === "second") {
    return (
      <div
        className={twMerge(
          "flex flex-row px-[20px] py-[16px] rounded-[30px] justify-between items-center",
          variants[variant],
          className
        )}
      >
        <div className="flex flex-row items-center gap-[12px]">
          <div className="w-[24px] h-[24px]  overflow-hidden">
            <img src={SilverMedal} alt="prize" />
          </div>
          <p className="font-medium text-[16px]">2 место</p>
        </div>
        <p className="text-[14px]">призёр</p>
      </div>
    );
  }

  if (variant === "third") {
    return (
      <div
        className={twMerge(
          "flex flex-row px-[20px] py-[16px] rounded-[30px] justify-between items-center",
          variants[variant],
          className
        )}
        style={{
          backgroundColor: "rgba(255, 100, 111, 0.1)",
        }}
      >
        <div className="flex flex-row items-center gap-[12px]">
          <div className="w-[24px] h-[24px]  overflow-hidden">
            <img src={BronzeMedal} alt="prize" />
          </div>
          <p className="font-medium text-[16px]">3 место</p>
        </div>
        <p className="text-[14px]">призёр</p>
      </div>
    );
  }

  if (variant === "not-finished") {
    return (
      <div
        className={twMerge(
          "flex flex-row px-[20px] py-[16px] rounded-[30px] justify-between items-center",
          variants[variant],
          className
        )}
      >
        <p className="text-[14px]">Результатов пока нет</p>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        "flex flex-row px-[20px] py-[16px] rounded-[30px] justify-between items-center",
        variants[variant],
        className
      )}
    >
      <p className="text-[14px]">
        Результат: <span className="text-black">участник</span>
      </p>
    </div>
  );
};
