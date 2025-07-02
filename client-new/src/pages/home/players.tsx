import { useGetUsers } from "../../api/hooks/useGetUsers";
import { PlayerCard } from "../../components/widgets/player-card";
import SearchBar from "../../components/widgets/search-bar";

export const Players = () => {
  const { data: users, isLoading } = useGetUsers({});

  if (isLoading) return null;
  return (
    <div className="flex flex-col gap-5">
      <SearchBar
        value={""}
        inputHandler={() => {}}
        placeholder={"Поиск игрока"}
      />
      <div className="flex flex-col gap-4 pb-[100px]">
        {users?.map((player) => (
          <PlayerCard
            key={player.id}
            avatar={player.avatar}
            firstName={player.firstName}
            lastName={player.lastName}
            location={player.city}
            rank={player.rank}
            position={player.playingPosition}
            bio={player.bio}
            loyalty={player.loyalty}
          />
        ))}
      </div>
    </div>
  );
};
