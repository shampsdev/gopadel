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

  const {
    data: tournaments,
    isLoading,
    error,
  } = useGetTournaments({ isAvailable: true });

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

        {!isLoading && !error && tournaments?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Турниры не найдены</p>
          </div>
        )}

        {tournaments?.map((competition: Tournament) => (
          <Link key={competition.id} to={`/tournament/${competition.id}`}>
            <CompetitionCard
              title={competition.name}
              key={competition.id}
              rank={
                mockRanks.find(
                  (r) =>
                    r.from <= competition.rankMin && r.to >= competition.rankMin
                ) || mockRanks[0]
              }
              organizerName={`${competition.organizator.firstName} ${competition.organizator.lastName}`}
              date={new Date(competition.startTime).toLocaleDateString(
                "ru-RU",
                {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Europe/Moscow",
                }
              )}
              locationTitle={competition.club.name}
              address={competition.club.address}
              type={competition.tournamentType}
              cost={competition.price}
              playersCapacity={competition.maxUsers}
              playersAmount={competition.participants?.length || 0}
              participating={false}
            />
          </Link>
        ))}
      </div>
    </>
  );
};
