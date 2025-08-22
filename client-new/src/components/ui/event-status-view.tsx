import { twMerge } from "tailwind-merge";
import { EventStatus } from "../../types/event-status.type";

export const EventStatusView = ({ status }: { status: EventStatus }) => {
  const defaultStyle =
    "text-[12px] font-normal text-black px-[10px] py-[6px] rounded-[10px]";
  switch (status) {
    case EventStatus.registration:
      return (
        <div>
          <div className={twMerge(defaultStyle, "bg-[#AFFF3F]")}>
            регистрация
          </div>
        </div>
      );
    case EventStatus.full:
      return (
        <div>
          <div className={twMerge(defaultStyle, "bg-[#F59E0B]")}>заполнено</div>
        </div>
      );
    case EventStatus.completed:
      return (
        <div>
          <div className={twMerge(defaultStyle, "bg-[#EBEDF0]")}>завершено</div>
        </div>
      );
    case EventStatus.cancelled:
      return (
        <div>
          <div className={twMerge(defaultStyle, "bg-[#FF5053] text-white")}>
            отменено
          </div>
        </div>
      );
    default:
      return null;
  }
};
