import {
  CompetitionCard,
  type CompetitionCardProps,
} from "../../components/widgets/competition-card";
import { useGetTournaments } from "../../api/hooks/useGetEvents";
import type { Tournament } from "../../types/tournament.type";
import type { FilterTournament } from "../../types/filter.type";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { HomeNavbar } from "../../components/widgets/home-navbar";
import { Preloader } from "../../components/widgets/preloader";

// Мок-данные для игр
const mockGames: CompetitionCardProps[] = [];

const mockTrainings: CompetitionCardProps[] = [];

export const Competitions = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const urlShowOnlyAvailable = searchParams.get("available") === "true";

  const [showOnlyAvailable, setShowOnlyAvailable] =
    useState(urlShowOnlyAvailable);

  useEffect(() => {
    setShowOnlyAvailable(urlShowOnlyAvailable);
  }, [urlShowOnlyAvailable]);

  const toggleSwitch = () => {
    const newValue = !showOnlyAvailable;
    setShowOnlyAvailable(newValue);

    const newSearchParams = new URLSearchParams(location.search);
    if (newValue) {
      newSearchParams.set("available", "true");
    } else {
      newSearchParams.delete("available");
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const filter: FilterTournament = {
    notFull: showOnlyAvailable || undefined,
    notEnded: true,
  };

  const { data: tournaments, isLoading } = useGetTournaments(filter);

  if (isLoading) return <Preloader />;

  const transformTournamentToCompetition = (
    tournament: Tournament
  ): CompetitionCardProps & { id: string; competitionType: string } => {
    return {
      id: tournament.id,
      rankMin: tournament.rankMin,
      rankMax: tournament.rankMax,
      organizerName: `${tournament.organizator?.firstName || ""} ${
        tournament.organizator?.lastName || ""
      }`,
      date: new Date(tournament.startTime).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Moscow",
      }),
      locationTitle: tournament.court?.name || "Неизвестное место",
      address: tournament.court?.address || "Адрес не указан",
      type: tournament.tournamentType || "Турнир",
      cost: tournament.price,
      playersCapacity: tournament.maxUsers,
      playersAmount: tournament.participants?.filter(
        (participant) =>
          participant.status === "ACTIVE" || participant.status === "PENDING"
      ).length,
      participating: false,
      title: tournament.name || "",
      competitionType: "tournament",
    };
  };

  const transformedTournaments = tournaments
    ? tournaments.map(transformTournamentToCompetition)
    : [];

  const allCompetitions = [
    ...transformedTournaments.map((tournament: any) => ({
      ...tournament,
    })),
    ...mockGames,
    ...mockTrainings,
  ];

  const filteredCompetitions = showOnlyAvailable
    ? allCompetitions.filter(
        (comp) => comp.playersAmount < comp.playersCapacity
      )
    : allCompetitions;

  return (
    <div className="pb-[100px]">
      <HomeNavbar />
      <div className="flex flex-row items-center py-6 px-5 border-[#EBEDF0] justify-between border-[1px] gap-6 rounded-[24px] bg-white">
        <p className="flex-1 flex-grow text-[14px] text-[#5D6674]">
          Только со свободными местами
        </p>
        <motion.div
          className="h-[28px] w-[60px] rounded-[16px] flex items-center cursor-pointer relative"
          onClick={toggleSwitch}
          animate={{
            backgroundColor: showOnlyAvailable ? "#AFFF3F" : "#F8F8FA",
          }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: 0 }}
        >
          <motion.div
            className="h-[20px] w-[20px] rounded-full bg-white shadow-sm absolute z-10 left-1"
            animate={{ x: showOnlyAvailable ? 32 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ zIndex: 0 }}
          />
        </motion.div>
      </div>

      <div className="flex flex-col gap-4  mt-4">
        {filteredCompetitions.map(
          (
            competition: CompetitionCardProps & {
              id: string;
              competitionType: string;
            }
          ) =>
            competition.competitionType === "tournament" ? (
              <Link key={competition.id} to={`/tournament/${competition.id}`}>
                <CompetitionCard
                  title={competition.title}
                  rankMin={competition.rankMin}
                  rankMax={competition.rankMax}
                  organizerName={competition.organizerName}
                  date={competition.date}
                  locationTitle={competition.locationTitle}
                  address={competition.address}
                  type={competition.type}
                  cost={competition.cost}
                  playersCapacity={competition.playersCapacity}
                  playersAmount={competition.playersAmount}
                  participating={competition.participating}
                />
              </Link>
            ) : (
              <CompetitionCard
                key={competition.id}
                title={competition.title}
                rankMin={competition.rankMin}
                rankMax={competition.rankMax}
                organizerName={competition.organizerName}
                date={competition.date}
                locationTitle={competition.locationTitle}
                address={competition.address}
                type={competition.type}
                cost={competition.cost}
                playersCapacity={competition.playersCapacity}
                playersAmount={competition.playersAmount}
                participating={competition.participating}
              />
            )
        )}
      </div>
    </div>
  );
};
