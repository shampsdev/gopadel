import { Link, useLocation } from "react-router";
import { Icons } from "../../assets/icons";
import { twMerge } from "tailwind-merge";

export default function BottomNavbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.endsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 py-[7px] bg-white  flex justify-around items-center ">
      <Link to="/">
        <div className="flex flex-col items-center justify-center">
          {Icons.House(isActive("/") ? "#000" : "#A4A9B4")}
          <p
            className={twMerge(
              "text-[12px]",
              isActive("/") ? "font-medium text-black" : "text-[#868D98]"
            )}
          >
            Главная
          </p>
        </div>
      </Link>
      <Link to="/players">
        <div className="flex flex-col items-center justify-center">
          {Icons.Players(isActive("/players") ? "#000" : "#A4A9B4")}
          <p
            className={twMerge(
              "text-[12px]",
              isActive("/players") ? "font-medium text-black" : "text-[#868D98]"
            )}
          >
            Игроки
          </p>
        </div>
      </Link>
      <Link to="/new-event">
        <div className="flex flex-col bg-[#AFFF3F] rounded-full p-[14px] items-center justify-center">
          {Icons.Cross()}
        </div>
      </Link>
      <Link to="/league">
        <div className="flex flex-col items-center justify-center">
          {Icons.League(isActive("/league") ? "#000" : "#A4A9B4")}
          <p
            className={twMerge(
              "text-[12px]",
              isActive("/league") ? "font-medium text-black" : "text-[#868D98]"
            )}
          >
            Лига
          </p>
        </div>
      </Link>

      <Link to="/profile">
        <div className="flex flex-col items-center justify-center">
          {Icons.Profile(isActive("/profile") ? "#000" : "#A4A9B4")}
          <p
            className={twMerge(
              "text-[12px]",
              isActive("/profile")
                ? "font-medium text-black"
                : " font-normal text-[#868D98]"
            )}
          >
            Профиль
          </p>
        </div>
      </Link>
    </div>
  );
}
