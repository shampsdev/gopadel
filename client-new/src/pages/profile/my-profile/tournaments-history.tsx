import { Link } from "react-router";
import { useGetMyRegistrations } from "../../../api/hooks/useGetMyRegistrations";
import { EventHistoryCard } from "../../../components/widgets/event-history-card";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { Preloader } from "../../../components/widgets/preloader";
import { EventStatus } from "../../../types/event-status.type";

export const TournamentsHistory = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { data: registrations, isLoading } = useGetMyRegistrations();

  if (isLoading) return <Preloader />;

  return (
    <div className="flex flex-col gap-9 pb-[100px]">
      <div className="flex flex-col px-[12px] gap-4">
        <p className="text-[24px] font-medium">Мои турниры</p>
      </div>

      <div className="flex flex-col gap-4">
        {registrations?.map((registration) => (
          <Link
            key={registration.event.id}
            to={`/event/${registration.event.id}`}
          >
            <EventHistoryCard
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
                registration.event.data?.result.leaderboard.find(
                  (place) => place.userId === registration.userId
                )?.place || null
              }
            />
          </Link>
        ))}
      </div>
    </div>
  );
};
