import { Link, useLocation } from "react-router";

export default function BottomNavbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      // Главная активна только на самой главной странице и на страницах турниров
      return (
        location.pathname === "/" || location.pathname.startsWith("/tournament")
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center shadow-lg navbar-container">
      <Link
        to="/"
        className={`flex flex-col items-center justify-center w-1/4 py-1 transition-colors ${
          isActive("/") ? "text-green-600" : "text-gray-600"
        }`}
      >
        <span className="text-xs mt-1">Главная</span>
      </Link>

      <Link
        to="/people"
        className={`flex flex-col items-center justify-center w-1/4 py-1 transition-colors ${
          isActive("/people") ? "text-green-600" : "text-gray-600"
        }`}
      >
        <span className="text-xs mt-1">Игроки</span>
      </Link>

      <Link
        to="/league"
        className={`flex flex-col items-center justify-center w-1/4 py-1 transition-colors ${
          isActive("/league") ? "text-green-600" : "text-gray-600"
        }`}
      >
        <span className="text-xs mt-1">Лига</span>
      </Link>

      <Link
        to="/profile"
        className={`flex flex-col items-center justify-center w-1/4 py-1 transition-colors ${
          isActive("/profile") ? "text-green-600" : "text-gray-600"
        }`}
      >
        <span className="text-xs mt-1">Профиль</span>
      </Link>
    </div>
  );
}
