import { Link, Navigate, useParams } from "react-router";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { getRankTitle } from "../../utils/rank-title";
import { Icons } from "../../assets/icons";
import { useGetUsers } from "../../api/hooks/useGetUsers";
import { formatBirthDate } from "../../utils/date-format";
import { formatUrl, getDisplayName } from "../../utils/format-url";
import { useAuthStore } from "../../shared/stores/auth.store";

export const UserProfile = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();

  const { data: user } = useGetUsers({ id: id ?? "" });

  if (!user) return null;

  if (user[0].id === currentUser?.id) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="flex flex-col gap-11 pb-[150px]">
      <div className="px-[8px] flex flex-row items-center gap-7 ">
        <div className="w-[80px] h-[80px] rounded-full overflow-none">
          <img
            className="object-cover rounded-full"
            src={user[0].avatar}
            alt="avatar"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-medium text-[18px]">
            {user[0].firstName} {user[0].lastName}
          </p>
          <p className="text-[17px] font-normal">@{user[0].telegramUsername}</p>
        </div>
      </div>

      <div className="flex flex-col px-[12px] space-y-0">
        {user[0].city && (
          <div className="pb-5 border-b border-[#DADCE0]">
            <div className="flex flex-row justify-between">
              <p className="text-[#868D98] text-[16px]">Город</p>
              <p className="text-[16px]">{user[0].city}</p>
            </div>
          </div>
        )}
        <div className="py-5 border-b border-[#DADCE0]">
          <div className="flex flex-row justify-between">
            <p className="text-[#868D98] text-[16px]">Ранг</p>
            <p className="text-[16px]">{getRankTitle(user[0].rank ?? 0)}</p>
          </div>
        </div>
        <div className="py-5 border-b border-[#DADCE0]">
          <div className="flex flex-row justify-between">
            <p className="text-[#868D98] text-[16px]">Квадрат игры</p>
            <p className="text-[16px]">
              {user[0].playingPosition === "left" && "Левый"}
              {user[0].playingPosition === "right" && "Правый"}
              {user[0].playingPosition === "both" && "В обоих"}
            </p>
          </div>
        </div>
        <div className="py-5 border-b border-[#DADCE0]">
          <Link to="/loyalty">
            <div className="flex flex-row justify-between items-center gap-[18px]">
              <div className="w-[42px] h-[42px] bg-[#AFFF3F] rounded-full flex flex-col items-center justify-center">
                {Icons.SharpStar()}
              </div>
              <div className="flex flex-col gap-[2px] flex-grow">
                <p className="text-[16px]">{user[0].loyalty.name}</p>
                <p className="text-[14px] text-[#868D98]">Уровень лояльности</p>
              </div>
              <div>{Icons.ArrowRight("#A4A9B4")}</div>
            </div>
          </Link>
        </div>
        {user[0].padelProfiles.length > 0 && (
          <div className="py-5 border-b border-[#DADCE0]">
            <div className="flex flex-col gap-[10px]">
              <p className="text-[#868D98] text-[16px]">Профили по падел</p>
              <div className="flex flex-col gap-2">
                {user[0].padelProfiles.split("\n").map((url: string) => (
                  <a
                    key={url}
                    href={formatUrl(url)}
                    className="flex no-underline md:underline flex-row items-center bg-[#F8F8FA] rounded-[30px] px-[20px] gap-4 py-[14px]"
                  >
                    <div>{Icons.Link()}</div>
                    <p className="text-[16px]">{getDisplayName(url)}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
        {user[0].birthDate && (
          <div className="py-5 border-b border-[#DADCE0]">
            <div className="flex flex-row justify-between">
              <p className="text-[#868D98] text-[16px]">Дата рождения</p>
              <p className="text-[16px]">
                {user[0].birthDate ? formatBirthDate(user[0].birthDate) : ""}
              </p>
            </div>
          </div>
        )}
        {user[0].bio && (
          <div className="py-5">
            <div className="flex flex-col gap-[10px]">
              <p className="text-[#868D98] text-[16px]">О себе</p>
              <p className="text-[16px]">{user[0].bio}</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-fit mx-auto">
        <Link to="edit">
          <div className="flex bg-[#34AADF]/20 flex-row py-[18px] px-[21px] rounded-[30px] gap-[16px] items-center">
            <p className="text-[#1392CB]">Написать в Telegram</p>
            <div className="w-[22px] h-[22px] flex flex-col justify-center items-center">
              {Icons.Telegram()}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
