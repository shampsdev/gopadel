import { PlayerCard } from "../../components/widgets/player-card";
import type { Loyalty } from "../../types/loyalty.type";
import type { PlayingPosition } from "../../types/playing-position.type";

// Мок-данные для игроков
const mockPlayers = [
  {
    id: 1,
    avatar:
      "https://storage.yandexcloud.net/gopadel/gopadel-dev/user/444109531/f95cd3175a7bc921df35e882adb74f5abfe86cf28ebc87487e36c7e69dc960b6.jpeg",
    firstName: "Алексей",
    lastName: "Петров",
    location: "Москва",
    rank: 4.5,
    position: "left" as PlayingPosition,
    bio: "Играю в падел уже 3 года. Люблю агрессивную игру и быстрые розыгрыши. Всегда готов к новым вызовам!",
    loyalty: {
      id: "gold",
      name: "Золотой уровень",
      description: "Премиум статус игрока",
      discount: "15%",
      requirements: "1000 очков",
    } as Loyalty,
  },
];

export const Players = () => {
  return (
    <div className="flex flex-col gap-4 pb-[100px]">
      {mockPlayers.map((player) => (
        <PlayerCard
          key={player.id}
          avatar={player.avatar}
          firstName={player.firstName}
          lastName={player.lastName}
          location={player.location}
          rank={player.rank}
          position={player.position}
          bio={player.bio}
          loyalty={player.loyalty}
        />
      ))}
    </div>
  );
};
