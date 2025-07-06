import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Search, Eye, Filter, RefreshCw, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { usersApi } from '../api/users';
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UserModal } from './UserModal';
import { getRatingLevelName } from '../utils/ratingUtils';
import type { User, FilterUser } from '../types/user';

const USERS_PER_PAGE = 10;

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const toast = useToastContext();
  const { user: currentUser } = useAuth();

  const loadUsers = async (filter: FilterUser = {}) => {
    setLoading(true);
    try {
      const usersData = await usersApi.filter(filter);
      setUsers(usersData);
      setCurrentPage(1); // Сбрасываем на первую страницу при новом поиске
    } catch (error: any) {
      console.error('Ошибка загрузки пользователей:', error);
      toast.error(error.response?.data?.error || 'Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = () => {
    const filter: FilterUser = {};
    
    if (searchTerm.trim()) {
      // Проверяем, является ли поисковый запрос числом (Telegram ID)
      const telegramId = parseInt(searchTerm.trim());
      if (!isNaN(telegramId)) {
        filter.telegramId = telegramId;
      } else {
        // Иначе ищем по имени
        filter.firstName = searchTerm.trim();
      }
    }
    
    loadUsers(filter);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    loadUsers();
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setSelectedUser(updatedUser);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPlayingPositionLabel = (position: string) => {
    switch (position) {
      case 'right': return 'Правая';
      case 'left': return 'Левая';
      case 'both': return 'Обе';
      default: return position;
    }
  };

  // Пагинация
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const currentUsers = users.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Поиск и фильтры */}
      <Card className="bg-zinc-900 border-zinc-800 flex-shrink-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2 text-white">
            <Filter className="h-5 w-5" />
            <span>Поиск и фильтры</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по имени или Telegram ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
              >
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Найти</span>
                <span className="sm:hidden">Поиск</span>
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white flex-1 sm:flex-none"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} ${loading ? '' : 'sm:mr-2'}`} />
                <span className="hidden sm:inline">Обновить</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица пользователей с фиксированной высотой и скроллом */}
      <Card className="bg-zinc-900 border-zinc-800 flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0 p-4 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base lg:text-lg text-white">
              Список пользователей ({users.length})
            </CardTitle>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs sm:text-sm text-zinc-400 whitespace-nowrap">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-zinc-400">Загрузка пользователей...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400">Пользователи не найдены</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              {/* Мобильная версия */}
              <div className="block md:hidden space-y-4 p-4">
                {currentUsers.map((user) => (
                  <Card key={user.id} className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                          <AvatarFallback className="bg-zinc-700 text-white text-sm">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white font-medium truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-zinc-400">@{user.telegramUsername}</p>
                              <p className="text-sm text-zinc-400">ID: {user.telegramId}</p>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button
                                onClick={() => handleViewUser(user)}
                                size="sm"
                                variant="outline"
                                className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {currentUser?.is_superuser && (
                                <Button
                                  onClick={() => handleEditUser(user)}
                                  size="sm"
                                  variant="outline"
                                  className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-zinc-400">Рейтинг:</span>
                              <span className="text-zinc-300">{getRatingLevelName(user.rank)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-zinc-400">Позиция:</span>
                              <span className="text-zinc-300">{getPlayingPositionLabel(user.playingPosition)}</span>
                            </div>
                            {user.loyalty && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Лояльность:</span>
                                <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                                  {user.loyalty.name}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Десктопная версия */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 z-10">
                    <tr>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Пользователь</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Telegram ID</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Рейтинг</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Позиция</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Лояльность</th>
                      <th className="text-right py-3 px-4 text-zinc-300 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                              <AvatarFallback className="bg-zinc-700 text-white text-xs">
                                {getInitials(user.firstName, user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-zinc-400">@{user.telegramUsername}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-300">{user.telegramId}</td>
                        <td className="py-3 px-4 text-zinc-300">{getRatingLevelName(user.rank)}</td>
                        <td className="py-3 px-4 text-zinc-300">
                          {getPlayingPositionLabel(user.playingPosition)}
                        </td>
                        <td className="py-3 px-4">
                          {user.loyalty ? (
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                              {user.loyalty.name}
                            </Badge>
                          ) : (
                            <span className="text-zinc-500">Нет</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleViewUser(user)}
                              size="sm"
                              variant="outline"
                              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Просмотр
                            </Button>
                            {currentUser?.is_superuser && (
                              <Button
                                onClick={() => handleEditUser(user)}
                                size="sm"
                                variant="outline"
                                className="bg-blue-600 border-blue-500 hover:bg-blue-700 text-white"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Редактировать
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно пользователя */}
      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          setIsEditMode(false);
        }}
        onUserUpdated={handleUserUpdated}
        canEdit={currentUser?.is_superuser || false}
        isEditMode={isEditMode}
      />
    </div>
  );
}; 