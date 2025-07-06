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
  ExternalLink,
  Calendar,
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { registrationsApi } from '../api/registrations';
import type { 
  RegistrationWithPayments as Registration, 
  AdminFilterRegistration as FilterRegistration, 
  TournamentOption, 
  UserOption,
  RegistrationStatus,
  Payment
} from '../api/registrations';

const REGISTRATIONS_PER_PAGE = 10;

const statusOptions: { value: RegistrationStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'PENDING', label: 'Ожидание', color: 'text-yellow-300', bgColor: 'bg-yellow-900/30' },
  { value: 'ACTIVE', label: 'Активна', color: 'text-green-300', bgColor: 'bg-green-900/30' },
  { value: 'CANCELED', label: 'Отменена', color: 'text-red-300', bgColor: 'bg-red-900/30' },
  { value: 'CANCELED_BY_USER', label: 'Отменена пользователем', color: 'text-orange-300', bgColor: 'bg-orange-900/30' },
];

const paymentStatusOptions: { value: Payment['status']; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'pending', label: 'Ожидание', icon: <Clock className="h-3 w-3" />, color: 'text-yellow-300 bg-yellow-900/20' },
  { value: 'waiting_for_capture', label: 'Ожидает подтверждения', icon: <AlertCircle className="h-3 w-3" />, color: 'text-blue-300 bg-blue-900/20' },
  { value: 'succeeded', label: 'Успешно', icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-300 bg-green-900/20' },
  { value: 'canceled', label: 'Отменен', icon: <XCircle className="h-3 w-3" />, color: 'text-red-300 bg-red-900/20' },
];

export const RegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserResults, setShowUserResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<RegistrationStatus>('PENDING');
  
  // Фильтры
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  const { error: showErrorToast, success: showSuccessToast } = useToastContext();

  useEffect(() => {
    loadTournaments();
  }, []);

  // Автоматический поиск при изменении фильтров
  useEffect(() => {
    if (selectedTournament || selectedUser || selectedStatus) {
      loadRegistrations();
    } else {
      setRegistrations([]);
    }
  }, [selectedTournament, selectedUser, selectedStatus]);

  const loadTournaments = async () => {
    try {
      const tournamentsData = await registrationsApi.getTournamentOptions();
      setTournaments(tournamentsData);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : undefined;
      showErrorToast(errorMessage || 'Ошибка при загрузке турниров');
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
    } catch (error: any) {
      console.error('Ошибка поиска пользователей:', error);
      setUsers([]);
    }
  };

  const loadRegistrations = async () => {
    if (!selectedTournament && !selectedUser && !selectedStatus) {
      return;
    }

    setLoading(true);
    try {
      const filter: FilterRegistration = {};
      
      if (selectedTournament) {
        filter.tournamentId = selectedTournament;
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
    } catch (error: any) {
      showErrorToast(error.response?.data?.error || 'Ошибка при загрузке регистраций');
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSelectedTournament('');
    setSelectedUser('');
    setSelectedStatus('');
    setUserSearchTerm('');
    setUsers([]);
    setRegistrations([]);
    setCurrentPage(1);
    setEditingStatus(null);
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

  const handleTournamentChange = (value: string) => {
    setSelectedTournament(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handleEditStatus = (registrationId: string, currentStatus: RegistrationStatus) => {
    setEditingStatus(registrationId);
    setNewStatus(currentStatus);
  };

  const handleSaveStatus = async (registrationId: string) => {
    try {
      const updatedRegistration = await registrationsApi.updateStatus(registrationId, newStatus);
      
      // Обновляем регистрацию в списке
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: updatedRegistration.status }
            : reg
        )
      );
      
      setEditingStatus(null);
      showSuccessToast('Статус регистрации успешно обновлен');
    } catch (error: any) {
      showErrorToast(error.response?.data?.error || 'Ошибка при обновлении статуса');
    }
  };

  const handleCancelEdit = () => {
    setEditingStatus(null);
  };

  const getStatusConfig = (status: RegistrationStatus) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const getPaymentStatusConfig = (status: Payment['status']) => {
    return paymentStatusOptions.find(s => s.value === status) || paymentStatusOptions[0];
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

  const openPaymentLink = (paymentLink: string) => {
    window.open(paymentLink, '_blank');
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Выбор турнира */}
            <div>
              <Label className="text-zinc-300 text-sm font-medium mb-2 block">Турнир</Label>
              <Select value={selectedTournament} onValueChange={handleTournamentChange}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Выберите турнир" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  {tournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Выбор пользователя */}
            <div>
              <Label className="text-zinc-300 text-sm font-medium mb-2 block">Пользователь</Label>
              <div className="relative user-search-container">
                <Input
                  value={userSearchTerm}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  onFocus={() => setShowUserResults(true)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-10"
                  placeholder="Введите имя пользователя"
                />
                {showUserResults && userSearchTerm && users.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-md mt-1 max-h-40 overflow-y-auto z-50">
                    {users.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center space-x-2 p-2 hover:bg-zinc-700 cursor-pointer"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-zinc-700 text-white text-xs">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-sm">@{user.telegramUsername}</p>
                          <p className="text-zinc-400 text-xs">{user.firstName} {user.lastName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Выбор статуса */}
            <div>
              <Label className="text-zinc-300 text-sm font-medium mb-2 block">Статус</Label>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} mr-2`} />
              Очистить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Таблица регистраций */}
      <Card className="bg-zinc-900 border-zinc-800 flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0 p-4 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base lg:text-lg text-white">
              Список регистраций ({registrations.length})
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
              <span className="ml-3 text-zinc-400">Загрузка регистраций...</span>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400">
                {!selectedTournament && !selectedUser && !selectedStatus
                  ? 'Выберите турнир, пользователя или статус для поиска регистраций'
                  : 'Регистрации не найдены'
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50 border-b border-zinc-700">
                    <tr>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Пользователь</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Турнир</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Статус</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Дата регистрации</th>
                      <th className="text-left py-3 px-4 text-zinc-300 font-medium">Платежи</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRegistrations.map((registration) => (
                      <tr key={registration.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
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
                              <p className="text-white font-medium">{registration.tournament?.name}</p>
                              <p className="text-sm text-zinc-400">
                                {registration.tournament && formatDate(registration.tournament.startTime)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {editingStatus === registration.id ? (
                            <div className="flex items-center space-x-2">
                              <Select value={newStatus} onValueChange={(value: string) => setNewStatus(value as RegistrationStatus)}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={() => handleSaveStatus(registration.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                size="sm"
                                variant="outline"
                                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusConfig(registration.status).color} ${getStatusConfig(registration.status).bgColor}`}>
                                {getStatusConfig(registration.status).label}
                              </div>
                              <Button
                                onClick={() => handleEditStatus(registration.id, registration.status)}
                                size="sm"
                                variant="outline"
                                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                            <span className="text-white">{formatDate(registration.date)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-2">
                            {registration.payments && registration.payments.length > 0 ? (
                              registration.payments?.map((payment: Payment, index: number) => {
                                const statusConfig = getPaymentStatusConfig(payment.status);
                                return (
                                  <div key={payment.id}>
                                    <div className="flex items-center space-x-2">
                                      <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                        {statusConfig.icon}
                                        <span>{statusConfig.label}</span>
                                      </div>
                                      <span className="text-white text-sm font-medium">{payment.amount}₽</span>
                                      <Button
                                        onClick={() => openPaymentLink(payment.paymentLink)}
                                        size="sm"
                                        variant="outline"
                                        className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white h-6 px-2"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    {index < registration.payments!.length - 1 && (
                                      <hr className="border-zinc-700 my-1" />
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-zinc-500 text-sm">Нет платежей</span>
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
    </div>
  );
};
