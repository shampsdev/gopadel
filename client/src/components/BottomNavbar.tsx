import { Link, useLocation } from "react-router-dom";
import { User, Users, Home, Trophy } from "lucide-react";

export default function BottomNavbar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-lg">
      <Link 
        to="/" 
        className={`flex flex-col items-center justify-center w-1/4 py-1 ${(location.pathname === '/' || isActive('/tournament')) ? 'text-green-600' : 'text-gray-600'}`}
      >
        <Home size={24} />
        <span className="text-xs mt-1">Главная</span>
      </Link>

      <Link 
        to="/people" 
        className={`flex flex-col items-center justify-center w-1/4 py-1 ${isActive('/people') ? 'text-green-600' : 'text-gray-600'}`}
      >
        <Users size={24} />
        <span className="text-xs mt-1">Игроки</span>
      </Link>

      <Link 
        to="/league" 
        className={`flex flex-col items-center justify-center w-1/4 py-1 ${isActive('/league') ? 'text-green-600' : 'text-gray-600'}`}
      >
        <Trophy size={24} />
        <span className="text-xs mt-1">Лига</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`flex flex-col items-center justify-center w-1/4 py-1 ${isActive('/profile') ? 'text-green-600' : 'text-gray-600'}`}
      >
        <User size={24} />
        <span className="text-xs mt-1">Профиль</span>
      </Link>
    </div>
  );
} 