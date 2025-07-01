import { CompetitionCard } from "../components/widgets/competition-card";
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
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">Соревнования</h1>

      {mockCompetitions.map((competition) => (
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
  );
};
