import { useGetMyRegistrations } from "../../../api/hooks/useGetMyRegistrations";
import { EventHistoryCard } from "../../../components/widgets/event-history-card";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { Preloader } from "../../../components/widgets/preloader";
import { EventStatus } from "../../../types/event-status.type";

export const EventsHistory = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { data: registrations, isLoading } = useGetMyRegistrations();

  if (isLoading) return <Preloader />;

  return (
    <div className="flex flex-col gap-9 pb-[100px]">
      <div className="flex flex-col px-[12px] gap-4">
        <p className="text-[24px] font-medium">Мои события</p>
      </div>

      <div className="flex flex-col gap-4">
        {registrations?.map((registration) => (
          <EventHistoryCard
            eventId={registration.event.id}
            eventType={registration.event.type}
            key={registration.event.id}
            rankMin={registration.event.rankMin}
            rankMax={registration.event.rankMax}
            organizerName={
              registration.event.organizer.firstName +
              " " +
              registration.event.organizer.lastName
            }
            date={new Date(registration.event.startTime).toLocaleDateString(
              "ru-RU",
              {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
            locationTitle={registration.event.court.name}
            address={registration.event.court.address}
            type={registration.event.type}
            name={registration.event.name}
            status={registration.status}
            isFinished={registration.event.status === EventStatus.completed}
            place={
              registration.event.data?.result?.leaderboard.find(
                (place) => place.userId === registration.userId
              )?.place || null
            }
          />
        ))}
      </div>
    </div>
  );
};
