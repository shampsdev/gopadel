import { Link } from "react-router";
import { useGetMyRegistrations } from "../../../api/hooks/useGetMyRegistrations";
import { CompetitionHistoryCard } from "../../../components/widgets/competition-history-card";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { Preloader } from "../../../components/widgets/preloader";

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
            key={registration.tournament.id}
            to={`/tournament/${registration.tournament.id}`}
          >
            <CompetitionHistoryCard
              rankMin={registration.tournament.rankMin}
              rankMax={registration.tournament.rankMax}
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
              locationTitle={registration.tournament.court.name}
              address={registration.tournament.court.address}
              type={registration.tournament.tournamentType}
              playersAmount={
                registration.tournament.participants.filter(
                  (participant) => participant.status === "ACTIVE"
                ).length
              }
              name={registration.tournament.name}
              status={registration.status}
              isFinished={registration.tournament.isFinished}
              place={
                registration.tournament.data?.result.leaderboard.find(
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
