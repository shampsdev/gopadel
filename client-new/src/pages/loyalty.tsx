import { LoyaltyAccordion } from "../components/ui/loyalty-accordion";
import { useGetLoyalties } from "../api/hooks/useGetLoyalties";
import { useTelegramBackButton } from "../shared/hooks/useTelegramBackButton";

export const Loyalty = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { data: loyalties, isLoading } = useGetLoyalties();
  return (
    <div className="flex flex-col gap-9 pb-[100px]">
      <div className="flex flex-col gap-4 px-[12px]">
        <p className="text-[24px] font-medium">Программа лояльности</p>
        <p className="text-[16px] text-[#868D98]">
          Программа лояльности GoPadel предлагает специальные привилегии
          постоянным участникам наших турниров
        </p>
      </div>

      <div className="px-[12px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full"></div>
        ) : (
          <LoyaltyAccordion loyalties={loyalties ?? []} />
        )}
      </div>
    </div>
  );
};
