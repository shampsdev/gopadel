import { Link, useLocation } from "react-router-dom";
import { User, Users, Trophy } from "lucide-react";

export default function BottomNavbar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-lg">
      <Link 
        to="/profile" 
        className={`flex flex-col items-center justify-center w-1/3 py-1 ${isActive('/profile') ? 'text-green-600' : 'text-gray-600'}`}
      >
        <User size={24} />
        <span className="text-xs mt-1">Профиль</span>
      </Link>
      
      <Link 
        to="/people" 
        className={`flex flex-col items-center justify-center w-1/3 py-1 ${isActive('/people') ? 'text-green-600' : 'text-gray-600'}`}
      >
        <Users size={24} />
        <span className="text-xs mt-1">Люди</span>
      </Link>
      
      <Link 
        to="/" 
        className={`flex flex-col items-center justify-center w-1/3 py-1 ${(location.pathname === '/' || isActive('/tournament')) ? 'text-green-600' : 'text-gray-600'}`}
      >
        <Trophy size={24} />
        <span className="text-xs mt-1">Турниры</span>
      </Link>
    </div>
  );
} 