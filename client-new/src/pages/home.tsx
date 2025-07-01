import { useState } from "react";
import { motion } from "framer-motion";
import { CompetitionCard } from "../components/widgets/competition-card";
import { HomeNavbar } from "../components/widgets/home-navbar";
import { ranks } from "../shared/constants/ranking";
import type { Rank } from "../types/rank.type";

// Мок-данные для рангов
const mockRanks: Rank[] = ranks;

// Мок-данные для соревнований
const mockCompetitions = [
  {
    id: 1,
    rank: mockRanks[0],
    organizerName: "Клуб Падель Сити",
    date: "25 декабря, 19:00",
    locationTitle: "Спортивный комплекс Арена",
    address: "ул. Спортивная, 15",
    type: "Парные игры",
    cost: 2500,
    playersCapacity: 16,
    playersAmount: 12,
    participating: false,
    category: "tournament" as const,
  },
  {
    id: 2,
    rank: mockRanks[1],
    organizerName: "Падель Академия",
    date: "26 декабря, 10:00",
    locationTitle: "Центральный корт",
    address: "пр. Олимпийский, 7",
    type: "Микс турнир",
    cost: 3000,
    playersCapacity: 8,
    playersAmount: 6,
    participating: true,
    category: "tournament" as const,
  },
  {
    id: 3,
    rank: mockRanks[2],
    organizerName: "Тренер Иван Петров",
    date: "27 декабря, 16:00",
    locationTitle: "Падель Клуб Премиум",
    address: "ул. Чемпионов, 3",
    type: "Индивидуальная тренировка",
    cost: 1500,
    playersCapacity: 4,
    playersAmount: 2,
    participating: false,
    category: "training" as const,
  },
  {
    id: 4,
    rank: mockRanks[1],
    organizerName: "Спорт Лига",
    date: "28 декабря, 14:00",
    locationTitle: "Корт на Набережной",
    address: "наб. Речная, 21",
    type: "Дружеская игра",
    cost: 800,
    playersCapacity: 4,
    playersAmount: 4,
    participating: false,
    category: "game" as const,
  },
  {
    id: 5,
    rank: mockRanks[3],
    organizerName: "Профи Падель",
    date: "30 декабря, 18:00",
    locationTitle: "Мастер Корт",
    address: "ул. Победы, 42",
    type: "Чемпионат города",
    cost: 5000,
    playersCapacity: 32,
    playersAmount: 28,
    participating: true,
    category: "tournament" as const,
  },
];

export const Home = () => {
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const toggleSwitch = () => {
    setShowOnlyAvailable(!showOnlyAvailable);
  };

  // Фильтруем соревнования по наличию свободных мест
  const filteredCompetitions = showOnlyAvailable
    ? mockCompetitions.filter(
        (comp) => comp.playersAmount < comp.playersCapacity
      )
    : mockCompetitions;

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

      <div className="flex flex-col gap-4 mt-4">
        {filteredCompetitions.map((competition) => (
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
            category={competition.category}
          />
        ))}
      </div>
    </>
  );
};
