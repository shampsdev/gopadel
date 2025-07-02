import { Icons } from "../../../assets/icons";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { getRankTitle } from "../../../utils/rank-title";
import { useGetMe } from "../../../api/hooks/useGetMe";
import { Link } from "react-router";
import { formatBirthDate } from "../../../utils/date-format";

export const MyProfile = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const { data: user } = useGetMe();

  return (
    <div className="flex flex-col gap-11 pb-[150px]">
      <div className="px-[8px] flex flex-row items-center gap-7 ">
        <div className="w-[80px] h-[80px] rounded-full overflow-none">
          <img
            className="object-cover rounded-full"
            src={user?.avatar}
            alt="avatar"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-medium text-[18px]">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-[17px] font-normal">@{user?.telegramUsername}</p>
        </div>
      </div>

      <Link to="tournaments">
        <div className="flex flex-row justify-between gap-[18px] items-center bg-[#F8F8FA] rounded-[30px] p-[16px]">
          <div className="flex flex-col items-center justify-center w-[42px] h-[42px] bg-[#AFFF3F] rounded-full">
            {Icons.History()}
          </div>
          <p className="flex-grow">История турниров</p>
          <div>{Icons.ArrowRight("black")}</div>
        </div>
      </Link>

      <div className="flex flex-col px-[12px] space-y-0">
        <div className="pb-5 border-b border-[#DADCE0]">
          <div className="flex flex-row justify-between">
            <p className="text-[#868D98] text-[16px]">Город</p>
            <p className="text-[16px]">{user?.city}</p>
          </div>
        </div>
        <div className="py-5 border-b border-[#DADCE0]">
          <div className="flex flex-row justify-between">
            <p className="text-[#868D98] text-[16px]">Ранг</p>
            <p className="text-[16px]">{getRankTitle(user?.rank ?? 0)}</p>
          </div>
        </div>
        <div className="py-5 border-b border-[#DADCE0]">
          <div className="flex flex-row justify-between">
            <p className="text-[#868D98] text-[16px]">Квадрат игры</p>
            <p className="text-[16px]">
              {user?.playingPosition === "left" && "Левый"}
              {user?.playingPosition === "right" && "Правый"}
              {user?.playingPosition === "both" && "В обоих"}
            </p>
          </div>
        </div>
        <div className="py-5 border-b border-[#DADCE0]">
          <Link to="../loyalty">
            <div className="flex flex-row justify-between items-center gap-[18px]">
              <div className="w-[42px] h-[42px] bg-[#AFFF3F] rounded-full flex flex-col items-center justify-center">
                {Icons.SharpStar()}
              </div>
              <div className="flex flex-col gap-[2px] flex-grow">
                <p className="text-[16px]">{user?.loyalty.name}</p>
                <p className="text-[14px] text-[#868D98]">Уровень лояльности</p>
              </div>
              <div>{Icons.ArrowRight("#A4A9B4")}</div>
            </div>
          </Link>
        </div>
        <div className="py-5 border-b border-[#DADCE0]">
          <div className="flex flex-col gap-[10px]">
            <p className="text-[#868D98] text-[16px]">Профили по падел</p>
            <div className="flex flex-col gap-2">
              {user?.padelProfiles.split("\n").map((url: string) => (
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
        </div>
        <div className="py-5 border-b border-[#DADCE0]">
          <div className="flex flex-row justify-between">
            <p className="text-[#868D98] text-[16px]">Дата рождения</p>
            <p className="text-[16px]">
              {user?.birthDate ? formatBirthDate(user.birthDate) : ""}
            </p>
          </div>
        </div>
        <div className="py-5">
          <div className="flex flex-col gap-[10px]">
            <p className="text-[#868D98] text-[16px]">О себе</p>
            <p>{user?.bio}</p>
          </div>
        </div>
      </div>

      <div className="w-fit mx-auto">
        <Link to="edit">
          <div className="flex bg-[#AFFF3F] flex-row py-[18px] px-[30px] rounded-[30px] gap-[16px] items-center">
            <p>Изменить</p>
            <div className="w-[22px] h-[22px] flex flex-col justify-center items-center">
              {Icons.Edit()}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
