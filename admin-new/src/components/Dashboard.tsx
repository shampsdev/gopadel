import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
  Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UsersPage } from './UsersPage';
import { AdminsPage } from './AdminsPage';
import type { NavItem } from '../types/navigation';

// Страницы-заглушки
const TournamentsPage = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Турниры</h2>
      <p className="text-zinc-400">Управление турнирами и соревнованиями</p>
    </div>
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-8 text-center">
        <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <p className="text-zinc-400">Страница турниров в разработке</p>
      </CardContent>
    </Card>
  </div>
);

const CourtsPage = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Корты</h2>
      <p className="text-zinc-400">Управление кортами и клубами</p>
    </div>
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-8 text-center">
        <Building className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <p className="text-zinc-400">Страница кортов в разработке</p>
      </CardContent>
    </Card>
  </div>
);

const RegistrationsPage = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Регистрации</h2>
      <p className="text-zinc-400">Управление регистрациями на турниры</p>
    </div>
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-8 text-center">
        <UserCheck className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <p className="text-zinc-400">Страница регистраций в разработке</p>
      </CardContent>
    </Card>
  </div>
);

const LoyaltyPage = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Лояльность</h2>
      <p className="text-zinc-400">Программы лояльности и скидки</p>
    </div>
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-8 text-center">
        <Gift className="h-16 w-16 text-pink-400 mx-auto mb-4" />
        <p className="text-zinc-400">Страница лояльности в разработке</p>
      </CardContent>
    </Card>
  </div>
);

const HomePage = ({ setCurrentPage, navItems }: { setCurrentPage: (page: string) => void, navItems: NavItem[] }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Панель управления</h2>
      <p className="text-zinc-400">Добро пожаловать в административную панель GoPadel</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {navItems.slice(1).map((item) => (
        <Card 
          key={item.id}
          className={`bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer group ${item.color}`}
          onClick={() => setCurrentPage(item.path)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                <CardDescription className="text-zinc-400 text-sm">
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

  // Добавляем раздел администраторов только для суперпользователей
  if (user?.is_superuser) {
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
        return <TournamentsPage />;
      case '/courts':
        return <CourtsPage />;
      case '/registrations':
        return <RegistrationsPage />;
      case '/loyalty':
        return <LoyaltyPage />;
      case '/admins':
        return user?.is_superuser ? <AdminsPage /> : <HomePage setCurrentPage={setCurrentPage} navItems={navItems} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} navItems={navItems} />;
    }
  };

  const currentNavItem = navItems.find(item => item.path === currentPage) || navItems[0];

  return (
    <div className="h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-white">GoPadel Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                currentPage === item.path
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.color.split(' ')[0]}`} />
              <span className="font-medium">{item.title}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center space-x-3 mb-3 px-3 py-2">
            <User className="h-4 w-4 text-zinc-400" />
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
            className="w-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <currentNavItem.icon className={`h-6 w-6 ${currentNavItem.color.split(' ')[0]}`} />
            <div>
              <h1 className="text-xl font-semibold text-white">{currentNavItem.title}</h1>
              <p className="text-sm text-zinc-400">{currentNavItem.description}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-6">
            {renderPage()}
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}; 