import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { useUser } from '../context/UserContext';

interface HeaderProps {
  isAdmin?: boolean;
}

const Header = ({ isAdmin = false }: HeaderProps) => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="bg-green-100 text-black p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">GO PADEL Admin</div>
        <div className="flex items-center space-x-6">
          <nav className="flex space-x-6">
            <button onClick={() => navigate('/users')} className="hover:text-gray-600 transition">
              Пользователи
            </button>
            <button onClick={() => navigate('/tournaments')} className="hover:text-gray-600 transition">
              Турниры
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
    </header>
  );
};

export default Header; 