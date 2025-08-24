import { Link, Navigate, useParams } from "react-router";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { getRankTitle } from "../../utils/rank-title";
import { Icons } from "../../assets/icons";
import { useGetUsers } from "../../api/hooks/useGetUsers";
import { formatBirthDate } from "../../utils/date-format";
import { formatUrl, getDisplayName } from "../../utils/format-url";
import { useAuthStore } from "../../shared/stores/auth.store";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { Preloader } from "../../components/widgets/preloader";
import { useState, useEffect } from "react";
import NoLoyalty from "../../assets/loyalty/no_loyalty.svg";
import PadelActive from "../../assets/loyalty/gopadel_active.svg";
import PadelFriend from "../../assets/loyalty/friend.svg";
import Aksakal from "../../assets/loyalty/aksakal.svg";
import Ambassador from "../../assets/loyalty/ambassador.svg";
import Partner from "../../assets/loyalty/partner.svg";
import Maekenas from "../../assets/loyalty/maekenas.svg";

export const UserProfile = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();

  const { data: users } = useGetUsers({ id: id ?? "" });
  const [scrollPosition, setScrollPosition] = useState(0);

  const user = users?.[0];
  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      const position = target.scrollTop || 0;
      setScrollPosition(position);
    };

    const scrollContainer = document.querySelector(".overflow-y-scroll");

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }

    const handleScrollFallback = () => {
      const position =
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        window.pageYOffset ||
        0;
      setScrollPosition(position);
    };
    window.addEventListener("scroll", handleScrollFallback, { passive: true });
    document.addEventListener("scroll", handleScrollFallback, {
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScrollFallback);
      document.removeEventListener("scroll", handleScrollFallback);
    };
  }, []);

  if (!users) return <Preloader />;

  if (id === currentUser?.id) {
    return <Navigate to="/profile" replace />;
  }

  const gradientOpacity = Math.max(0, 1 - scrollPosition / 150);

  return (
    <div className="relative flex flex-col pb-[150px]">
      {/* Фиксированный фон */}
      <div
        className="fixed top-0 left-0 w-screen h-[240px] z-0"
        style={{
          backgroundImage: "url('/src/assets/profile_background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Градиентное затемнение */}

      <div
        className="rounded-t-[40px] w-[100vw] bg-white z-30 relative overflow-hidden"
        style={{
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          marginTop: 50,
        }}
      >
        <div className="relative z-[2] flex flex-col gap-4 px-[16px] pt-[20px]">
          {/* Блок никнейма внутри общего контента */}
          <div className="px-[16px] flex flex-row items-center gap-7 ">
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden ring-2 ring-white/80">
              <img
                className="object-cover w-full h-full"
                src={user?.avatar}
                alt="avatar"
              />
            </div>
            <div className="flex flex-col justify-between gap-[15px]">
              <div className="flex flex-col gap-[4px]">
                <p className="font-medium text-[18px] text-black">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[14px] font-normal text-black">
                  @{user?.telegramUsername}
                </p>
              </div>
              {user?.city && (
                <div className="flex flex-row text-[#5D6674] text-[14px] items-center gap-[6px]">
                  <div>{Icons.Location("#A4A9B4", "16", "16")}</div>
                  <div>{user?.city}</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-[8px] mt-[8px]">
            <div className="flex flex-row gap-[8px]">
              <div className="flex flex-col flex-1 bg-[#AFFF3F] px-[24px] rounded-[24px] py-[16px]">
                <div className="text-[14px] text-[#5D6674]">Уровень</div>
                <div className="text-[16px]">
                  {getRankTitle(user?.rank ?? 0)}
                </div>
              </div>
              <div className="p-[24px] text-[20px] rounded-[24px] text-white bg-black">
                {user?.rank}
              </div>
            </div>
            <div className="flex flex-row justify-between w-full p-[24px] bg-[#EBEDF0] rounded-[24px] items-center">
              <div className="flex flex-col ">
                <div className="text-[14px] text-[#5D6674]">Квадрат игры</div>
                <div className="text-[16px] ">
                  {user?.playingPosition === "" && "Не выбрано"}
                  {user?.playingPosition === "left" && "Левый"}
                  {user?.playingPosition === "right" && "Правый"}
                  {user?.playingPosition === "both" && "В обоих"}
                </div>
              </div>
              <div className="flex flex-row gap-[2px]">
                <div className="flex flex-row items-center justify-center bg-[white] rounded-[12px] p-[20px] w-[56px]">
                  {(user?.playingPosition === "left" ||
                    user?.playingPosition === "both") &&
                    Icons.ActivePosition()}
                  {!(
                    user?.playingPosition === "left" ||
                    user?.playingPosition === "both"
                  ) && Icons.DisabledPosition()}
                </div>

                <div className="flex flex-row items-center justify-center bg-[white] rounded-[12px] p-[20px] w-[56px]">
                  {(user?.playingPosition === "right" ||
                    user?.playingPosition === "both") &&
                    Icons.ActivePosition()}
                  {!(
                    user?.playingPosition === "right" ||
                    user?.playingPosition === "both"
                  ) && Icons.DisabledPosition()}
                </div>
              </div>
            </div>
          </div>
          <div className="py-5 px-[16px] border-[#DADCE0]">
            <Link to="/loyalty">
              <div className="flex flex-row justify-between items-center gap-[18px]">
                <div className="w-[42px] h-[42px] p-[8px] bg-[#041124] rounded-full flex flex-col items-center justify-center">
                  {user?.loyalty.id === 1 && <img src={NoLoyalty} />}
                  {user?.loyalty.id === 2 && <img src={PadelActive} />}
                  {user?.loyalty.id === 3 && <img src={PadelFriend} />}
                  {user?.loyalty.id === 4 && <img src={Aksakal} />}
                  {user?.loyalty.id === 5 && <img src={Ambassador} />}
                  {user?.loyalty.id === 8 && <img src={Partner} />}
                  {user?.loyalty.id === 7 && <img src={Maekenas} />}
                </div>
                <div className="flex flex-col gap-[2px] flex-grow">
                  <p className="text-[16px]">{user?.loyalty.name}</p>
                  <p className="text-[14px] text-[#868D98]">
                    Уровень лояльности
                  </p>
                </div>
                <div>{Icons.ArrowRight("#A4A9B4")}</div>
              </div>
            </Link>
          </div>

          <div className="flex flex-col px-[12px] space-y-0">
            {user?.padelProfiles && user?.padelProfiles.length > 0 && (
              <div className="py-5 border-b border-[#DADCE0] border-t">
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[#868D98] text-[16px]">Профили по падел</p>
                  <div className="flex flex-col gap-2">
                    {user?.padelProfiles.split("\n").map((url: string) => (
                      <a
                        key={url}
                        href={formatUrl(url)}
                        target="_blank"
                        rel="noopener noreferrer"
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
            {user?.birthDate && (
              <div className="py-5 border-b border-[#DADCE0]">
                <div className="flex flex-row justify-between">
                  <p className="text-[#868D98] text-[16px]">Дата рождения</p>
                  <p className="text-[16px]">
                    {user?.birthDate ? formatBirthDate(user.birthDate) : ""}
                  </p>
                </div>
              </div>
            )}
            {user?.bio && (
              <div className="py-5">
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[#868D98] text-[16px]">О себе</p>
                  <p className="text-[16px]">{user?.bio}</p>
                </div>
              </div>
            )}
          </div>

          <div className="w-fit mx-auto">
            <div
              onClick={() => {
                if (user?.telegramUsername) {
                  openTelegramLink(`https://t.me/${user.telegramUsername}`);
                }
              }}
              className="flex bg-[#34AADF]/20 flex-row py-[18px] px-[21px] rounded-[30px] gap-[16px] items-center"
            >
              <p className="text-[#1392CB]">Написать в Telegram</p>
              <div className="w-[22px] h-[22px] flex flex-col justify-center items-center">
                {Icons.Telegram()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
