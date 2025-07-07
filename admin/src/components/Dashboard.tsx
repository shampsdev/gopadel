import React, { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { 
  Users, 
  Trophy, 
  Building, 
  UserCheck, 
  Gift, 
  Shield,
  LogOut,
  User,
  Home,
  Menu,
  X,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UsersPage } from './UsersPage';
import { AdminsPage } from './AdminsPage';
import { LoyaltyPage } from './LoyaltyPage';
import { CourtsPage } from './CourtsPage';
import { RegistrationsPage } from './RegistrationsPage';
import { ClubsPage } from './ClubsPage';
import { TournamentsPage } from './TournamentsPage';
import type { NavItem } from '../types/navigation';

interface NavigationParams {
  tournamentId?: string;
  tournamentName?: string;
}

const HomePage = ({ setCurrentPage, navItems }: { setCurrentPage: (page: string, params?: NavigationParams) => void, navItems: NavItem[] }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Панель управления</h2>
      <p className="text-zinc-400">Добро пожаловать в административную панель GoPadel</p>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {navItems.slice(1).map((item) => (
        <Card 
          key={item.id}
          className={`bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer group ${item.color}`}
          onClick={() => setCurrentPage(item.path)}
        >
          <CardHeader className="pb-3 p-4 md:p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 md:p-3 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                <item.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-white text-base md:text-lg truncate">{item.title}</CardTitle>
                <CardDescription className="text-zinc-400 text-xs md:text-sm line-clamp-2">
                  {item.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('/');
  const [navigationParams, setNavigationParams] = useState<NavigationParams>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Определение навигационных элементов с учетом прав пользователя
  const allNavItems: NavItem[] = [
  {
    id: 'home',
    title: 'Главная',
    description: 'Панель управления',
    icon: Home,
    color: 'text-zinc-400',
    path: '/'
  },
  {
    id: 'users',
    title: 'Пользователи',
    description: 'Управление пользователями системы',
    icon: Users,
    color: 'text-blue-400 hover:border-blue-400/50',
    path: '/users'
  },
  {
    id: 'tournaments',
    title: 'Турниры',
    description: 'Управление турнирами и соревнованиями',
    icon: Trophy,
    color: 'text-yellow-400 hover:border-yellow-400/50',
    path: '/tournaments'
  },
  {
    id: 'courts',
    title: 'Корты',
    description: 'Управление кортами и клубами',
    icon: Building,
    color: 'text-green-400 hover:border-green-400/50',
    path: '/courts'
  },
  {
    id: 'registrations',
    title: 'Регистрации',
    description: 'Управление регистрациями на турниры',
    icon: UserCheck,
    color: 'text-purple-400 hover:border-purple-400/50',
    path: '/registrations'
  },
  {
    id: 'loyalty',
    title: 'Лояльность',
    description: 'Программы лояльности и скидки',
    icon: Gift,
    color: 'text-pink-400 hover:border-pink-400/50',
    path: '/loyalty'
    }
  ];

  // Добавляем разделы только для суперпользователей
  if (user?.is_superuser) {
    allNavItems.push({
    id: 'clubs',
    title: 'Клубы',
    description: 'Управление клубами',
    icon: Building2,
    color: 'text-emerald-400 hover:border-emerald-400/50',
    path: '/clubs'
    });
    
    allNavItems.push({
    id: 'admins',
    title: 'Администраторы',
    description: 'Управление правами администраторов',
    icon: Shield,
    color: 'text-red-400 hover:border-red-400/50',
    path: '/admins'
    });
  }

  const navItems = allNavItems;

  const renderPage = () => {
    switch (currentPage) {
      case '/users':
        return <UsersPage />;
      case '/tournaments':
        return <TournamentsPage onNavigateToRegistrations={handleNavigateToRegistrations} />;
      case '/courts':
        return <CourtsPage />;
      case '/registrations':
        return <RegistrationsPage tournamentId={navigationParams.tournamentId} tournamentName={navigationParams.tournamentName} />;
      case '/loyalty':
        return <LoyaltyPage />;
      case '/clubs':
        return user?.is_superuser ? <ClubsPage /> : <HomePage setCurrentPage={setCurrentPage} navItems={navItems} />;
      case '/admins':
        return user?.is_superuser ? <AdminsPage /> : <HomePage setCurrentPage={setCurrentPage} navItems={navItems} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} navItems={navItems} />;
    }
  };

  const currentNavItem = navItems.find(item => item.path === currentPage) || navItems[0];

  const handlePageChange = (path: string) => {
    setCurrentPage(path);
    setSidebarOpen(false); // Закрываем sidebar на мобильных после выбора
  };

  const handleNavigateToRegistrations = (tournamentId: string, tournamentName: string) => {
    setNavigationParams({ tournamentId, tournamentName });
    setCurrentPage('/registrations');
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-zinc-950 flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="text-lg lg:text-xl font-bold text-white">GoPadel Admin</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 h-8 w-8 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 lg:py-2 rounded-lg transition-colors text-left ${
                currentPage === item.path
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <item.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${item.color.split(' ')[0]} flex-shrink-0`} />
              <span className="font-medium text-sm lg:text-base truncate">{item.title}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 lg:p-4 border-t border-zinc-800">
          <div className="flex items-center space-x-3 mb-3 px-3 py-2">
            <User className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              {user?.is_superuser && (
                <p className="text-xs text-red-400">Супер-админ</p>
              )}
            </div>
          </div>
          
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white text-sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full lg:w-auto">
        {/* Header */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-4 lg:px-6 py-3 lg:py-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 h-8 w-8 text-zinc-400 hover:text-white mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <currentNavItem.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${currentNavItem.color.split(' ')[0]} flex-shrink-0`} />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg lg:text-xl font-semibold text-white truncate">{currentNavItem.title}</h1>
              <p className="text-xs lg:text-sm text-zinc-400 truncate">{currentNavItem.description}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 lg:p-6">
              {renderPage()}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}; 