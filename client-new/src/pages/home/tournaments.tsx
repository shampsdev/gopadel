import { CompetitionCard } from "../../components/widgets/competition-card";
import { ranks } from "../../shared/constants/ranking";
import type { Rank } from "../../types/rank.type";
import { useGetTournaments } from "../../api/hooks/useGetTournaments";
import type { Tournament } from "../../types/tournament.type";
import type { FilterTournament } from "../../types/filter.type";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { HomeNavbar } from "../../components/widgets/home-navbar";

// Мок-данные для рангов
const mockRanks: Rank[] = ranks;

export const Tournaments = () => {
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
    isAvailable: showOnlyAvailable || undefined,
  };

  const { data: tournaments, isLoading, error } = useGetTournaments(filter);

  const transformTournamentToCompetition = (tournament: Tournament) => {
    const rank =
      mockRanks.find(
        (r) => r.from <= tournament.rankMin && r.to >= tournament.rankMin
      ) || mockRanks[0];
    const participantsCount = tournament.participants?.length || 0;

    return {
      id: tournament.id,
      rank,
      organizerName:
        `${tournament.organizator?.firstName || ""} ${
          tournament.organizator?.lastName || ""
        }`.trim() ||
        tournament.club?.name ||
        "Неизвестно",
      date: new Date(tournament.startTime).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }),
      locationTitle: tournament.club?.name || "Неизвестное место",
      address: tournament.club?.address || "Адрес не указан",
      type: tournament.tournamentType || "Турнир",
      cost: tournament.price,
      playersCapacity: tournament.maxUsers,
      playersAmount: participantsCount,
      participating: false,
    };
  };

  const transformedCompetitions = tournaments
    ? tournaments.map(transformTournamentToCompetition)
    : [];

  return (
    <>
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
        >
          <motion.div
            className="h-[20px] w-[20px] rounded-full bg-white shadow-sm absolute left-1"
            animate={{ x: showOnlyAvailable ? 32 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </motion.div>
      </div>

      <div className="flex flex-col gap-4 pb-[100px] mt-4">
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Загрузка турниров...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Ошибка загрузки турниров</p>
          </div>
        )}

        {!isLoading && !error && transformedCompetitions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Турниры не найдены</p>
          </div>
        )}

        {transformedCompetitions.map((competition: any) => (
          <Link to={`/tournaments/${competition.id}`}>
            <CompetitionCard
              key={competition.id}
              rank={competition.rank}
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
        ))}
      </div>
    </>
  );
};
