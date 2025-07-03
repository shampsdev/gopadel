import { Link } from "react-router";
import { useGetMyRegistrations } from "../../../api/hooks/useGetMyRegistrations";
import { CompetitionHistoryCard } from "../../../components/widgets/competition-history-card";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";

export const TournamentsHistory = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { data: registrations } = useGetMyRegistrations();

  return (
    <div className="flex flex-col gap-9 pb-[100px]">
      <div className="flex flex-col px-[12px] gap-4">
        <p className="text-[24px] font-medium">Мои турниры</p>
      </div>

      <div className="flex flex-col gap-4">
        {registrations?.map((registration) => (
          <Link
            key={registration.tournament.id}
            to={`/tournament/${registration.tournament.id}`}
          >
            <CompetitionHistoryCard
              rank={registration.tournament.rankMin}
              organizerName={
                registration.tournament.organizator.firstName +
                " " +
                registration.tournament.organizator.lastName
              }
              date={new Date(
                registration.tournament.startTime
              ).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
              locationTitle={registration.tournament.club.name}
              address={registration.tournament.club.address}
              type={registration.tournament.tournamentType}
              playersCapacity={registration.tournament.playersCapacity}
              playersAmount={registration.tournament.playersAmount}
              status={registration.status}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};
