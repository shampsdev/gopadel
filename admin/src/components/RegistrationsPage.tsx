import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Trophy
} from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { registrationsApi } from '../api/registrations';
import type { 
  RegistrationWithPayments as Registration, 
  AdminFilterRegistration as FilterRegistration, 
  TournamentOption, 
  UserOption,
  RegistrationStatus
} from '../api/registrations';

const REGISTRATIONS_PER_PAGE = 10;

interface RegistrationsPageProps {
  eventId?: string;
  eventName?: string;
}

const statusOptions: { value: RegistrationStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'PENDING', label: 'Ожидание', color: 'text-yellow-300', bgColor: 'bg-yellow-900/30' },
  { value: 'INVITED', label: 'Приглашён', color: 'text-blue-300', bgColor: 'bg-blue-900/30' },
  { value: 'CONFIRMED', label: 'Подтверждено', color: 'text-green-300', bgColor: 'bg-green-900/30' },
  { value: 'CANCELLED', label: 'Отменена', color: 'text-red-300', bgColor: 'bg-red-900/30' },
  { value: 'LEFT', label: 'Покинул', color: 'text-gray-300', bgColor: 'bg-gray-900/30' },
];

// Опции статусов платежей (пока не используются)
// const paymentStatusOptions: { value: Payment['status']; label: string; icon: React.ReactNode; color: string }[] = [
//   { value: 'pending', label: 'Ожидание', icon: <Clock className="h-3 w-3" />, color: 'text-yellow-300 bg-yellow-900/20' },
//   { value: 'succeeded', label: 'Успешно', icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-300 bg-green-900/20' },
//   { value: 'canceled', label: 'Отменен', icon: <XCircle className="h-3 w-3" />, color: 'text-red-300 bg-red-900/20' },
//   { value: 'refunded', label: 'Возврат', icon: <AlertCircle className="h-3 w-3" />, color: 'text-purple-300 bg-purple-900/20' },
// ];

export const RegistrationsPage: React.FC<RegistrationsPageProps> = ({ eventId: initialEventId }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserResults, setShowUserResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Фильтры
  const [selectedEvent, setSelectedEvent] = useState<string>(initialEventId || '');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  const { error: showErrorToast } = useToastContext();

  useEffect(() => {
    loadEvents();
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

  const getStatusConfig = (status: RegistrationStatus) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
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
                  {statusOptions.map((status) => (
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
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Дата регистрации</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRegistrations.map((registration, index) => (
                      <tr key={`${registration.userId}-${registration.eventId}-${index}`} className="border-b border-zinc-800 hover:bg-zinc-800/50">
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
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(registration.status).bgColor} ${getStatusConfig(registration.status).color}`}>
                              {getStatusConfig(registration.status).label}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-zinc-300">{formatDate(registration.createdAt)}</p>
                        </td>
                      </tr>
                    ))}
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
    </div>
  );
};
