import { Icons } from "../assets/icons";

export const Loyalty = () => {
  return (
    <div className="flex flex-col gap-9">
      <div className="flex flex-col gap-4 px-[12px]">
        <p className="text-[24px] font-medium">Программа лояльности</p>
        <p className="text-[16px] text-[#868D98]">
          Программа лояльности GoPadel предлагает специальные привилегии
          постоянным участникам наших турниров
        </p>
      </div>

      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-row justify-between items-center gap-[18px]">
          <div className="w-[42px] h-[42px] bg-[#AFFF3F] rounded-full flex flex-col items-center justify-center">
            {Icons.SharpStar()}
          </div>
          <div className="flex flex-col gap-[2px] flex-grow">
            <p className="text-[16px]">Золотой</p>
            <p className="text-[14px] text-[#868D98]">Уровень лояльности</p>
          </div>
          <div>{Icons.ArrowRight("#A4A9B4")}</div>
        </div>
      </div>
    </div>
  );
};
