import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { adminsApi } from '../api/admins';
import { AdminModal } from './AdminModal';
import type { AdminUser, FilterAdminUser } from '../types/admin';

const ADMINS_PER_PAGE = 10;

export const AdminsPage: React.FC = () => {
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToastContext();
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Проверяем, что текущий пользователь - суперюзер
  if (!user?.is_superuser) {
    return (
      <div className="space-y-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Доступ запрещен</h3>
            <p className="text-zinc-400">Только суперпользователи могут управлять администраторами</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadAdmins = async (filter: FilterAdminUser = {}) => {
    setLoading(true);
    try {
      if (searchTerm.trim()) {
        filter.username = searchTerm.trim();
      }
      
      const data = await adminsApi.filter(filter);
      setAdmins(data);
      setCurrentPage(1);
    } catch (error: any) {
      showErrorToast(error.response?.data?.error || 'Ошибка при загрузке администраторов');
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleSearch = () => {
    const filter: FilterAdminUser = {};
    
    if (searchTerm.trim()) {
      filter.username = searchTerm.trim();
    }
    
    loadAdmins(filter);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    loadAdmins();
  };

  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleViewAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (!confirm(`Вы уверены, что хотите удалить администратора "${admin.username}"?`)) {
      return;
    }

    try {
      await adminsApi.delete(admin.id);
      showSuccessToast('Администратор успешно удален');
      loadAdmins();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Ошибка при удалении администратора';
      showErrorToast(message);
    }
  };

  const handleModalSuccess = () => {
    loadAdmins();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Пагинация
  const totalPages = Math.ceil(admins.length / ADMINS_PER_PAGE);
  const startIndex = (currentPage - 1) * ADMINS_PER_PAGE;
  const endIndex = startIndex + ADMINS_PER_PAGE;
  const currentAdmins = admins.slice(startIndex, endIndex);

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
                placeholder="Поиск по имени пользователя..."
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

      {/* Таблица администраторов с фиксированной высотой и скроллом */}
      <Card className="bg-zinc-900 border-zinc-800 flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0 p-4 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base lg:text-lg text-white">
              Список администраторов ({admins.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateAdmin}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Добавить администратора</span>
                <span className="sm:hidden">Добавить</span>
              </Button>
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
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-zinc-400">Загрузка администраторов...</span>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400">Администраторы не найдены</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              {/* Мобильная версия */}
              <div className="block md:hidden space-y-4 p-4">
                {currentAdmins.map((admin) => (
                  <Card key={admin.id} className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={admin.user?.avatar} alt={`${admin.first_name} ${admin.last_name}`} />
                          <AvatarFallback className="bg-zinc-700 text-white text-sm">
                            {getInitials(admin.first_name, admin.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white font-medium truncate">
                                {admin.first_name} {admin.last_name}
                              </p>
                              <p className="text-sm text-zinc-400">@{admin.username}</p>
                              {admin.user && (
                                <p className="text-sm text-zinc-400">
                                  @{admin.user.telegramUsername}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button
                                onClick={() => handleViewAdmin(admin)}
                                size="sm"
                                variant="outline"
                                className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleEditAdmin(admin)}
                                size="sm"
                                variant="outline"
                                className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteAdmin(admin)}
                                size="sm"
                                variant="outline"
                                className="bg-red-600 border-red-500 hover:bg-red-700 text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center space-x-2">
                              {admin.is_superuser && (
                                <Badge variant="outline" className="border-yellow-600 text-yellow-300">
                                  Суперпользователь
                                </Badge>
                              )}
                            </div>
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
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Администратор</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Пользователь</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Статус</th>
                      <th className="text-right py-3 px-4 text-zinc-300 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAdmins.map((admin) => (
                      <tr key={admin.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={admin.user?.avatar} alt={`${admin.first_name} ${admin.last_name}`} />
                              <AvatarFallback className="bg-zinc-700 text-white text-xs">
                                {getInitials(admin.first_name, admin.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium">
                                {admin.first_name} {admin.last_name}
                              </p>
                              <p className="text-sm text-zinc-400">@{admin.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {admin.user ? (
                            <div>
                              <p className="text-white">@{admin.user.telegramUsername}</p>
                              <p className="text-sm text-zinc-400">{admin.user.firstName} {admin.user.lastName}</p>
                            </div>
                          ) : (
                            <span className="text-zinc-500">Не привязан</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {admin.is_superuser && (
                              <Badge variant="outline" className="border-yellow-600 text-yellow-300">
                                Суперпользователь
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleViewAdmin(admin)}
                              size="sm"
                              variant="outline"
                              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Просмотр
                            </Button>
                            <Button
                              onClick={() => handleEditAdmin(admin)}
                              size="sm"
                              variant="outline"
                              className="bg-blue-600 border-blue-500 hover:bg-blue-700 text-white"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Редактировать
                            </Button>
                            <Button
                              onClick={() => handleDeleteAdmin(admin)}
                              size="sm"
                              variant="outline"
                              className="bg-red-600 border-red-500 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </Button>
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

      {/* Модальное окно администратора */}
      <AdminModal
        admin={selectedAdmin}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAdmin(null);
          setIsEditMode(false);
        }}
        onSuccess={handleModalSuccess}
        isEditMode={isEditMode}
      />
    </div>
  );
}; 