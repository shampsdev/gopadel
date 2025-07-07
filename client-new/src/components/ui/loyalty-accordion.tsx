import { useState } from "react";
import { Icons } from "../../assets/icons";
import type { Loyalty } from "../../types/loyalty.type";

interface AccordionItemProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = ({
  title,
  subtitle,
  icon,
  description,
  isOpen,
  onToggle,
}: AccordionItemProps) => {
  return (
    <div className="flex flex-col">
      <div className="bg-[#F8F8FA] rounded-[30px]">
        <div
          className="flex flex-row justify-between items-center gap-[18px] py-[16px] pl-[16px] pr-[20px] cursor-pointer"
          onClick={onToggle}
        >
          <div className="w-[42px] h-[42px] bg-[#AFFF3F] rounded-full flex flex-col items-center justify-center">
            {icon}
          </div>
          <div className="flex flex-col gap-[2px] flex-grow">
            <p className="text-[16px]">{title}</p>
            <p className="text-[14px] text-[#868D98]">{subtitle}</p>
          </div>
          <div
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-[-90deg]" : "rotate-90"
            }`}
          >
            {Icons.ArrowRight("#A4A9B4")}
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen && description.length > 0
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-[20px] px-[21px] text-[14px] text-[#868D98] leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};

export const LoyaltyAccordion = ({ loyalties }: { loyalties: Loyalty[] }) => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  if (!loyalties) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-[16px] text-[#868D98]">
          У вас нет доступных программ лояльности
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-[12px]">
      {loyalties.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.name}
          subtitle={`Скидка: ${item.discount}%`}
          icon={Icons.SharpStar()}
          isOpen={openItems.includes(index)}
          onToggle={() => toggleItem(index)}
          description={item.description}
        />
      ))}
    </div>
  );
};
