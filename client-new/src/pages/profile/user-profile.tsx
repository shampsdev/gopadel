import { useParams } from "react-router";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { getRankTitle } from "../../utils/rank-title";
import { Icons } from "../../assets/icons";
import { useGetUsers } from "../../api/hooks/useGetUsers";

export const UserProfile = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { id } = useParams();

  const { data: user } = useGetUsers({ id: id ?? "" });

  if (!user) return null;

  return (
    <div className="flex flex-col gap-11 items-center">
      <div className="flex flex-row items-center ">
        <img src={user[0].avatar} alt="avatar" />
        <div className="flex flex-col gap-1">
          <p>
            {user[0].firstName} {user[0].lastName}
          </p>
          <p>@{user[0].telegramUsername}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <p>Город</p>
          <p>{user[0].city}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p>Ранг</p>
          <p>{getRankTitle(user?.[0].rank ?? 0)}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p>Квадрат игры</p>
          <p>{user[0].playingPosition}</p>
        </div>
        <div className="flex flex-row justify-between">
          <div>{Icons.SharpStar()}</div>
          <div className="flex flex-col gap-[2px]">
            <p>{user[0].loyalty.name}</p>
            <p>Уровень лояльности</p>
          </div>
        </div>
        <div className="flex flex-col gap-[10px]">
          <p>Профили по падел</p>
          <div className="flex flex-col gap-2">
            {user[0].padelProfiles.split("\n").map((url: string) => (
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
          <p>{user[0].birthDate}</p>
        </div>

        <div className="flex flex-col gap-[10px]">
          <p>О себе</p>
          <p>{user[0].bio}</p>
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
