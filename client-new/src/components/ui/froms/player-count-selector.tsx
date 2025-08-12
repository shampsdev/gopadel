import { twMerge } from "tailwind-merge";

interface PlayerCountItemProps {
  count: number;
  onClick: () => void;
  variant: "active" | "default";
}

const PlayerCountItem = ({
  count,
  onClick,
  variant = "default",
}: PlayerCountItemProps) => {
  const variants = {
    active: "bg-[#AFFF3F] text-black",
    default: "bg-[#F8F8FA] text-[#868D98]",
  };

  return (
    <div
      onClick={onClick}
      className={twMerge(
        "flex flex-col gap-[4px] items-center justify-center px-6 py-[16px] rounded-[12px] cursor-pointer flex-1",
        variants[variant]
      )}
    >
      <p className="text-lg font-medium">{count}</p>
    </div>
  );
};

interface PlayerCountSelectorProps {
  selectedCount: number | null;
  onCountChange: (count: number) => void;
  className?: string;
}

export const PlayerCountSelector = ({
  selectedCount,
  onCountChange,
  className,
}: PlayerCountSelectorProps) => {
  const playerCounts = [4, 5, 6, 7, 8];

  return (
    <div
      className={twMerge(
        "flex flex-row w-full gap-3 justify-center flex-wrap",
        className
      )}
    >
      {playerCounts.map((count) => (
        <PlayerCountItem
          key={count}
          count={count}
          onClick={() => onCountChange(count)}
          variant={selectedCount === count ? "active" : "default"}
        />
      ))}
    </div>
  );
};
