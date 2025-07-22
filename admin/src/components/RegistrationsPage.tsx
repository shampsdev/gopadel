import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Trophy,
  CreditCard,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { RegistrationModal } from './RegistrationModal';
import { registrationsApi } from '../api/registrations';
import type { 
  RegistrationWithPayments as Registration, 
  AdminFilterRegistration as FilterRegistration, 
  TournamentOption, 
  UserOption,
  RegistrationStatus
} from '../api/registrations';
import { allStatusOptions, gameStatusOptions, tournamentStatusOptions } from '../api/registrations';

const REGISTRATIONS_PER_PAGE = 10;

interface RegistrationsPageProps {
  eventId?: string;
  eventName?: string;
}

export const RegistrationsPage: React.FC<RegistrationsPageProps> = ({ eventId: initialEventId }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserResults, setShowUserResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<RegistrationStatus>('PENDING');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Фильтры
  const [selectedEvent, setSelectedEvent] = useState<string>(initialEventId || '');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  const { user } = useAuth();
  const { error: showErrorToast, success: showSuccessToast } = useToastContext();

  const canEditStatus = user?.is_superuser || false;

  useEffect(() => {
    loadEvents();
    // Автоматически загружаем регистрации если есть начальные фильтры
    if (initialEventId) {
      loadRegistrations();
    }
  }, []);

  // Автоматический поиск при изменении фильтров
  useEffect(() => {
    if (selectedEvent || selectedUser || selectedStatus) {
      loadRegistrations();
    } else {
      setRegistrations([]);
    }
  }, [selectedEvent, selectedUser, selectedStatus]);

  const loadEvents = async () => {
    try {
      const eventsData = await registrationsApi.getTournamentOptions();
      setTournaments(eventsData);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : undefined;
      showErrorToast(errorMessage || 'Ошибка при загрузке событий');
    }
  };

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }
    
    try {
      const usersData = await registrationsApi.searchUsers({ telegramUsername: searchTerm });
      setUsers(usersData);
    } catch (error: unknown) {
      console.error('Ошибка поиска пользователей:', error);
      setUsers([]);
    }
  };

  const loadRegistrations = async () => {
    if (!selectedEvent && !selectedUser && !selectedStatus) {
      return;
    }

    setLoading(true);
    try {
      const filter: FilterRegistration = {};
      
      if (selectedEvent) {
        filter.eventId = selectedEvent;
      }
      
      if (selectedUser) {
        filter.userId = selectedUser;
      }
      
      if (selectedStatus) {
        filter.status = selectedStatus as RegistrationStatus;
      }
      
      const data = await registrationsApi.filter(filter);
      setRegistrations(data);
      setCurrentPage(1);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : undefined;
      showErrorToast(errorMessage || 'Ошибка при загрузке регистраций');
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSelectedEvent('');
    setSelectedUser('');
    setSelectedStatus('');
    setUserSearchTerm('');
    setUsers([]);
    setRegistrations([]);
    setCurrentPage(1);
  };

  const handleUserSearch = (searchTerm: string) => {
    setUserSearchTerm(searchTerm);
    setShowUserResults(true);
    searchUsers(searchTerm);
  };

  const handleUserSelect = (user: UserOption) => {
    setSelectedUser(user.id);
    setUserSearchTerm(`${user.firstName} ${user.lastName} (@${user.telegramUsername})`);
    setShowUserResults(false);
  };

  const handleEventChange = (value: string) => {
    setSelectedEvent(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handleViewPayments = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsModalOpen(true);
  };

  const getRegistrationKey = (registration: Registration) => {
    return `${registration.userId}-${registration.eventId}`;
  };

  const getAvailableStatuses = (eventType?: string) => {
    if (eventType === 'game') {
      return gameStatusOptions;
    } else if (eventType === 'tournament') {
      return tournamentStatusOptions;
    }
    return allStatusOptions;
  };

  const handleEditStatus = (registration: Registration) => {
    const key = getRegistrationKey(registration);
    setEditingStatusId(key);
    setNewStatus(registration.status);
  };

  const handleSaveStatus = async (registration: Registration) => {
    setUpdatingStatus(true);
    try {
      const updatedRegistration = await registrationsApi.updateStatus(
        registration.userId,
        registration.eventId,
        { status: newStatus }
      );
      
      // Обновляем локальное состояние
      setRegistrations(prev => 
        prev.map(reg => 
          reg.userId === updatedRegistration.userId && reg.eventId === updatedRegistration.eventId
            ? updatedRegistration
            : reg
        )
      );
      
      setEditingStatusId(null);
      showSuccessToast('Статус регистрации обновлен');
    } catch (error: any) {
      console.error('Ошибка обновления статуса:', error);
      showErrorToast(error.response?.data?.error || 'Ошибка при обновлении статуса');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStatusId(null);
    setNewStatus('PENDING');
  };

  const getStatusConfig = (status: RegistrationStatus) => {
    return allStatusOptions.find(s => s.value === status) || allStatusOptions[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Пагинация
  const totalPages = Math.ceil(registrations.length / REGISTRATIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * REGISTRATIONS_PER_PAGE;
  const endIndex = startIndex + REGISTRATIONS_PER_PAGE;
  const currentRegistrations = registrations.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Обработчик клика вне области для скрытия результатов поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-search-container')) {
        setShowUserResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-400" />
            Фильтры регистраций
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Фильтр по событию */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Событие</Label>
              <Select value={selectedEvent} onValueChange={handleEventChange}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Выберите событие" />
                </SelectTrigger>
                                 <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="">Все события</SelectItem>
                  {tournaments.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Поиск пользователя */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Пользователь</Label>
              <div className="relative user-search-container">
                <Input
                  placeholder="Поиск по username"
                  value={userSearchTerm}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
                
                {showUserResults && users.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-zinc-800 border border-zinc-700 rounded-md mt-1 max-h-60 overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="p-3 hover:bg-zinc-700 cursor-pointer border-b border-zinc-700 last:border-b-0"
                      >
                        <div className="text-white font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-zinc-400">
                          @{user.telegramUsername}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Фильтр по статусу */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Статус</Label>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                                 <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="">Все статусы</SelectItem>
                  {allStatusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <span className={status.color}>{status.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Кнопки действий */}
            <div className="flex items-end gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список регистраций */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">
            Регистрации ({registrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-zinc-400 mt-2">Загрузка регистраций...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Регистрации не найдены</h3>
              <p className="text-zinc-400">Выберите фильтры для поиска регистраций</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50 border-b border-zinc-700">
                    <tr>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Пользователь</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Событие</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Статус</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Платежи</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Дата регистрации</th>
                      {canEditStatus && <th className="text-right py-3 px-4 text-zinc-300 font-medium">Действия</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {currentRegistrations.map((registration, index) => {
                      const key = getRegistrationKey(registration);
                      const isEditing = editingStatusId === key;
                      
                      return (
                        <tr key={`${key}-${index}`} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-zinc-700 text-white text-xs">
                                  {registration.user && getInitials(registration.user.firstName, registration.user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-medium">
                                  {registration.user?.firstName} {registration.user?.lastName}
                                </p>
                                <p className="text-sm text-zinc-400">@{registration.user?.telegramUsername}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <div>
                                <p className="text-white font-medium">{registration.event?.name}</p>
                                <p className="text-sm text-zinc-400">
                                  {registration.event && formatDate(registration.event.startTime)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <div className="flex items-center space-x-2">
                                                                 <Select 
                                   value={newStatus} 
                                   onValueChange={(value) => setNewStatus(value as RegistrationStatus)}
                                 >
                                   <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white w-40">
                                     <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="bg-zinc-800 border-zinc-700">
                                     {getAvailableStatuses(registration.event?.type).map((status) => (
                                       <SelectItem key={status.value} value={status.value}>
                                         <span className={status.color}>{status.label}</span>
                                       </SelectItem>
                                     ))}
                                   </SelectContent>
                                 </Select>
                                <Button
                                  onClick={() => handleSaveStatus(registration)}
                                  disabled={updatingStatus}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 px-2"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={handleCancelEdit}
                                  disabled={updatingStatus}
                                  size="sm"
                                  variant="outline"
                                  className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 px-2"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(registration.status).bgColor} ${getStatusConfig(registration.status).color}`}>
                                  {getStatusConfig(registration.status).label}
                                </div>
                                {canEditStatus && (
                                  <Button
                                    onClick={() => handleEditStatus(registration)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 hover:bg-zinc-700"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {registration.payments && registration.payments.length > 0 ? (
                                <Button
                                  onClick={() => handleViewPayments(registration)}
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center space-x-2 bg-green-600/20 border-green-600 text-green-300 hover:bg-green-600/30 hover:border-green-500"
                                >
                                  <CreditCard className="h-4 w-4" />
                                  <span>Платежи ({registration.payments.length})</span>
                                </Button>
                              ) : (
                                <span className="text-zinc-500 text-sm">Нет платежей</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-zinc-300">{formatDate(registration.createdAt)}</p>
                          </td>
                          {canEditStatus && (
                            <td className="py-3 px-4 text-right">
                              {!isEditing && (
                                <Button
                                  onClick={() => handleEditStatus(registration)}
                                  size="sm"
                                  variant="outline"
                                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Изменить статус
                                </Button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          )}

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-zinc-400">
                Показано {startIndex + 1}-{Math.min(endIndex, registrations.length)} из {registrations.length}
              </p>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-white">
                  Страница {currentPage} из {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно платежей */}
      <RegistrationModal
        registration={selectedRegistration}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRegistration(null);
        }}
      />
    </div>
  );
};
