import { useState } from "react";
import { Icons } from "../../assets/icons";
import type { Loyalty } from "../../types/loyalty.type";
import NoLoyalty from "../../assets/loyalty/no_loyalty.svg";
import PadelActive from "../../assets/loyalty/gopadel_active.svg";
import PadelFriend from "../../assets/loyalty/friend.svg";
import Aksakal from "../../assets/loyalty/aksakal.svg";
import Ambassador from "../../assets/loyalty/ambassador.svg";
import Partner from "../../assets/loyalty/partner.svg";
import Maekenas from "../../assets/loyalty/maekenas.svg";

interface AccordionItemProps {
  title: string;
  subtitle: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  id: number;
  activeId: number;
}

const AccordionItem = ({
  title,
  subtitle,
  description,
  isOpen,
  onToggle,
  id,
  activeId,
}: AccordionItemProps) => {
  return (
    <div className="flex flex-col">
      <div
        className={`rounded-[30px] ${
          id === activeId ? "bg-[#041124] text-white" : "bg-[#F8F8FA] "
        }`}
      >
        <div
          className="flex flex-row justify-between items-center gap-[18px] py-[16px] pl-[16px] pr-[20px] cursor-pointer"
          onClick={onToggle}
        >
          <div className="w-[42px] h-[42px] rounded-full flex flex-col items-center justify-center">
            {id === 1 && <img src={NoLoyalty} />}
            {id === 2 && <img src={PadelActive} />}
            {id === 3 && <img src={PadelFriend} />}
            {id === 4 && <img src={Aksakal} />}
            {id === 5 && <img src={Ambassador} />}
            {id === 8 && <img src={Partner} />}
            {id === 7 && <img src={Maekenas} />}
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

export const LoyaltyAccordion = ({
  loyalties,
  activeId,
}: {
  loyalties: Loyalty[];
  activeId?: number;
}) => {
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
          id={item.id}
          key={index}
          title={item.name}
          subtitle={`Скидка: ${item.discount}%`}
          isOpen={openItems.includes(index)}
          onToggle={() => toggleItem(index)}
          description={item.description}
          activeId={activeId ?? 0}
        />
      ))}
    </div>
  );
};
