import { useState, useMemo } from "react";
import { useGetUsers } from "../../api/hooks/useGetUsers";
import { PlayerCard } from "../../components/widgets/player-card";
import SearchBar from "../../components/widgets/search-bar";
import { Link } from "react-router";
import { Preloader } from "../../components/widgets/preloader";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";

export const Players = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { data: users, isLoading } = useGetUsers({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users || !searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase().trim();

    return users.filter((player) => {
      const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
      const city = player.city?.toLowerCase() || "";
      const bio = player.bio?.toLowerCase() || "";

      return (
        fullName.includes(query) || city.includes(query) || bio.includes(query)
      );
    });
  }, [users, searchQuery]);

  if (isLoading) return <Preloader />;

  return (
    <div className="flex flex-col gap-5">
      <SearchBar
        value={searchQuery}
        inputHandler={setSearchQuery}
        placeholder={"Поиск игрока"}
      />
      <div className="flex flex-col gap-4 pb-[100px]">
        {filteredUsers?.map((player) => (
          <Link key={player.id} to={`/profile/${player.id}`}>
            <PlayerCard
              avatar={player.avatar}
              firstName={player.firstName}
              lastName={player.lastName}
              location={player.city}
              rank={player.rank}
              position={player.playingPosition}
              bio={player.bio}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};
