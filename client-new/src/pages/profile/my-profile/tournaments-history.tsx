import { useGetMyRegistrations } from "../../../api/hooks/useGetMyRegistrations";
import { CompetitionHistoryCard } from "../../../components/widgets/competition-history-card";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";

export const TournamentsHistory = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { data: registrations } = useGetMyRegistrations();

  return (
    <div className="flex flex-col gap-9">
      <div className="flex flex-col px-[12px] gap-4">
        <p className="text-[24px] font-medium">Мои турниры</p>
      </div>

      <div className="flex flex-col gap-4">
        {registrations?.map((registration) => (
          <CompetitionHistoryCard
            key={registration.id}
            rank={registration.tournament.rank}
            organizerName={registration.tournament.organizer.name}
            date={registration.date}
            locationTitle={registration.tournament.location.city}
            address={""}
            type={""}
            playersCapacity={0}
            playersAmount={0}
            status={registration.status}
          />
        ))}
      </div>
    </div>
  );
};
