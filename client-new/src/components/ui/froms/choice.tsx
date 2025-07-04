import ChoiceIcon from "../../../assets/choice.svg";

interface ChoiceProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  value: string;
  onChange: (v: string) => void;
}

export const Choice = ({ value, onOpen, onChange }: ChoiceProps) => {
  const preventTouch = (e: React.TouchEvent) => {
    e.stopPropagation();
  };
  return (
    <div className="flex flex-row gap-[12px]">
      <div
        className="flex flex-1 relative flex-row items-center border-[#F5F5F5] border-[2px] text-[#A2ACB0] pl-[16px] py-[12px] rounded-[14px] gap-[10px]"
        style={{ touchAction: "none" }}
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="outline-none w-[80%]"
          placeholder="Название поля"
          onTouchStart={preventTouch}
        />
        <img
          className="absolute right-[18px]"
          src={ChoiceIcon}
          onClick={onOpen}
          onTouchStart={preventTouch}
        />
        {
          <div className="flex flex-col gap-[12px] absolute right-0 translate-x-[2px] translate-y-[-2px] top-0 border-[#F5F5F5] z-10 border-[2px] text-[#A2ACB0] rounded-[14px] py-[12px] px-[16px] bg-white">
            {/* тут список рангов */}
            <div
              className="flex flex-row items-center justify-end gap-[12px] text-black"
              onClick={() => {}}
              onTouchStart={preventTouch}
            >
              абзац
            </div>
            <div
              className="flex flex-row gap-[12px] items-center"
              onClick={() => {}}
              onTouchStart={preventTouch}
            >
              строка
            </div>
          </div>
        }
      </div>
    </div>
  );
};
