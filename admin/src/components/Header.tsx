import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { useUser } from '../context/UserContext';
import { useState } from 'react';

interface HeaderProps {
  isAdmin?: boolean;
}

const Header = ({ isAdmin = false }: HeaderProps) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="bg-green-100 text-black p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">GO PADEL</div>
        
        {/* Mobile menu button */}
        <button 
          className="lg:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <nav className="flex space-x-6">
            <button onClick={() => navigate('/dashboard')} className="hover:text-gray-600 transition">
              Главная
            </button>
            <button onClick={() => navigate('/users')} className="hover:text-gray-600 transition">
              Пользователи
            </button>
            <button onClick={() => navigate('/tournaments')} className="hover:text-gray-600 transition">
              Турниры
            </button>
            <button onClick={() => navigate('/payments')} className="hover:text-gray-600 transition">
              Платежи
            </button>
            <button onClick={() => navigate('/loyalty')} className="hover:text-gray-600 transition">
              Лояльность
            </button>
            {isAdmin && (
              <button onClick={() => navigate('/admins')} className="hover:text-gray-600 transition">
                Администраторы
              </button>
            )}
          </nav>
          <div className="flex items-center space-x-4 border-l border-green-300 pl-4">
            <div className="text-sm">
              <span className="opacity-75">Вы вошли как: </span>
              <span className="font-medium">{user?.username || 'Администратор'}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-1 rounded transition"
            >
              Выход
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden mt-4 py-2 px-1 border-t border-green-200">
          <nav className="flex flex-col space-y-2">
            <button 
              onClick={() => {
                navigate('/dashboard');
                setIsMenuOpen(false);
              }} 
              className="py-2 px-1 hover:bg-green-200 rounded transition"
            >
              Главная
            </button>
            <button 
              onClick={() => {
                navigate('/users');
                setIsMenuOpen(false);
              }} 
              className="py-2 px-1 hover:bg-green-200 rounded transition"
            >
              Пользователи
            </button>
            <button 
              onClick={() => {
                navigate('/tournaments');
                setIsMenuOpen(false);
              }} 
              className="py-2 px-1 hover:bg-green-200 rounded transition"
            >
              Турниры
            </button>
            <button 
              onClick={() => {
                navigate('/payments');
                setIsMenuOpen(false);
              }} 
              className="py-2 px-1 hover:bg-green-200 rounded transition"
            >
              Платежи
            </button>
            <button 
              onClick={() => {
                navigate('/loyalty');
                setIsMenuOpen(false);
              }} 
              className="py-2 px-1 hover:bg-green-200 rounded transition"
            >
              Лояльность
            </button>
            {isAdmin && (
              <button 
                onClick={() => {
                  navigate('/admins');
                  setIsMenuOpen(false);
                }} 
                className="py-2 px-1 hover:bg-green-200 rounded transition"
              >
                Администраторы
              </button>
            )}
          </nav>
          <div className="mt-4 pt-3 border-t border-green-200 flex flex-col space-y-3">
            <div className="text-sm">
              <span className="opacity-75">Вы вошли как: </span>
              <span className="font-medium">{user?.username || 'Администратор'}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="bg-green-700 hover:bg-green-800 text-white py-2 rounded transition w-full"
            >
              Выход
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 