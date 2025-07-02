import { useParams } from "react-router";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import type { User } from "../../types/user.type";
import { getRankTitle } from "../../utils/rank-title";
import { Icons } from "../../assets/icons";

export const UserProfile = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { id } = useParams();

  const user: User = {
    avatar: "",
    bio: "",
    birthDate: "",
    city: "",
    firstName: "",
    lastName: "",
    id: "",
    isRegistered: false,
    loyalty: {
      id: "",
      name: "",
      description: "",
      discount: "",
      requirements: "",
    },
    padelProfiles: "",
    playingPosition: "left",
    rank: 0,
    telegramId: 0,
    telegramUsername: "",
  };
  return (
    <div className="flex flex-col gap-11 items-center">
      <div className="flex flex-row items-center ">
        <img src={user.avatar} alt="avatar" />
        <div className="flex flex-col gap-1">
          <p>
            {user.firstName} {user.lastName}
          </p>
          <p>@{user.telegramUsername}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <p>Город</p>
          <p>{user.city}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p>Ранг</p>
          <p>{getRankTitle(user.rank)}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p>Квадрат игры</p>
          <p>{user.playingPosition}</p>
        </div>
        <div className="flex flex-row justify-between">
          <div>{Icons.SharpStar()}</div>
          <div className="flex flex-col gap-[2px]">
            <p>{user.loyalty.name}</p>
            <p>Уровень лояльности</p>
          </div>
        </div>
        <div className="flex flex-col gap-[10px]">
          <p>Профили по падел</p>
          <div className="flex flex-col gap-2">
            {user.padelProfiles.split("\n").map((url: string) => (
              <a
                key={url}
                href={url}
                className="flex no-underline md:underline flex-row items-center"
              >
                <div>{Icons.Star()}</div>
                <p>{url}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-row items-center">
          <p>Дата рождения</p>
          <p>{user.birthDate}</p>
        </div>

        <div className="flex flex-col gap-[10px]">
          <p>О себе</p>
          <p>{user.bio}</p>
        </div>
      </div>

      <div className="w-fit mx-auto">
        <div className="flex flex-row py-[18px] px-[21px] rounded-[30px] gap-[16px]">
          <p>Написать в Telegram</p>
          <div>{Icons.ArrowRight()}</div>
        </div>
      </div>
    </div>
  );
};
