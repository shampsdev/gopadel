import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Edit, Trash2, Save, X, Gamepad2, Calendar, MapPin, UserCheck, Clock, Users } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale/ru';
import "react-datepicker/dist/react-datepicker.css";
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { eventsApi, type Event, type CreateEvent, type AdminPatchEvent, type EventStatus } from '../api/events';
import { StatusSelector } from './StatusSelector';
import { clubsApi, type Club } from '../api/clubs';
import { courtsApi, type Court } from '../api/courts';
import { adminsApi } from '../api/admins';
import { registrationsApi, type RegistrationWithPayments } from '../api/registrations';
import { waitlistApi, type WaitlistUser } from '../api/waitlist';
import type { AdminUser } from '../types/admin';
import { ratingLevels, getRatingRangeDescription } from '../utils/ratingUtils';

// Регистрируем русскую локаль для DatePicker
registerLocale('ru', ru);

interface GamesPageProps {
  onNavigateToRegistrations?: (eventId: string, eventName: string) => void;
}

export const GamesPage: React.FC<GamesPageProps> = ({ onNavigateToRegistrations }) => {
  const [games, setGames] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithPayments[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [waitlist, setWaitlist] = useState<WaitlistUser[]>([]);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    clubId: '',
    organizerId: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    startTime: null as Date | null,
    endTime: null as Date | null,
    price: 0,
    rankMin: 0,
    rankMax: 7,
    maxUsers: 4,
    description: '',
    courtId: '',
    clubId: '',
    organizerId: '',
  });

  const toast = useToastContext();
  const { user } = useAuth();
  
  // Проверяем права доступа
  const canEdit = user?.is_superuser || user?.is_active || false;

  const convertLocalDateToUtc = (localDate: Date): string => {
    if (!localDate) return '';
    return localDate.toISOString();
  };

  const convertUtcToLocalDate = (utcDateTime: string): Date | null => {
    if (!utcDateTime) return null;
    return new Date(utcDateTime);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGames(),
        loadClubs(),
        loadCourts(),
        loadAdmins(),
      ]);
    } catch (error: unknown) {
      toast.error('Ошибка при загрузке данных');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGames = async () => {
    try {
      const data = await eventsApi.filter({ type: 'game' });
      setGames(data);
    } catch (error: unknown) {
      toast.error('Ошибка при загрузке игр');
      console.error('Error loading games:', error);
    }
  };

  const loadClubs = async () => {
    try {
      const data = await clubsApi.getAll();
      setClubs(data);
    } catch (error: unknown) {
      console.error('Error loading clubs:', error);
    }
  };

  const loadCourts = async () => {
    try {
      const data = await courtsApi.getAll();
      setCourts(data);
    } catch (error: unknown) {
      console.error('Error loading courts:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      const data = await adminsApi.filter({});
      const adminsWithUser = data.filter((admin: AdminUser) => admin.user && admin.user.telegramUsername);
      setAdmins(adminsWithUser);
    } catch (error: unknown) {
      console.error('Error loading admins:', error);
    }
  };

  const loadRegistrations = async (eventId: string) => {
    setLoadingRegistrations(true);
    try {
      const data = await registrationsApi.filter({ eventId });
      setRegistrations(data);
    } catch (error: unknown) {
      toast.error('Ошибка при загрузке регистраций');
      console.error('Error loading registrations:', error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const loadWaitlist = async (eventId: string) => {
    setLoadingWaitlist(true);
    try {
      const data = await waitlistApi.getEventWaitlist(eventId);
      setWaitlist(data);
    } catch (error: unknown) {
      toast.error('Ошибка при загрузке списка ожидания');
      console.error('Error loading waitlist:', error);
    } finally {
      setLoadingWaitlist(false);
    }
  };

  // Функция для обновления статуса регистрации (пока отключена)
  // const handleStatusChange = async (registrationId: string, newStatus: RegistrationStatus) => {
  //   try {
  //     // Обновление статуса пока недоступно в новом API
  //     toast.error('Обновление статуса регистрации временно недоступно');
  //     console.warn('updateStatus not supported in new API');
  //   } catch (error: unknown) {
  //     toast.error('Ошибка при изменении статуса');
  //     console.error('Error updating registration status:', error);
  //   }
  // };

  const handleEventStatusChange = async (eventId: string, newStatus: EventStatus) => {
    try {
      await eventsApi.updateStatus(eventId, newStatus);
      toast.success('Статус события обновлен');
      
      // Обновляем локальное состояние
      setGames(prev => 
        prev.map(game => 
          game.id === eventId 
            ? { ...game, status: newStatus }
            : game
        )
      );
      
      // Обновляем выбранную игру если она изменилась
      if (selectedGame && selectedGame.id === eventId) {
        setSelectedGame((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error: unknown) {
      toast.error('Ошибка при изменении статуса события');
      console.error('Error updating event status:', error);
    }
  };

  const handleGameSelect = (game: Event) => {
    setSelectedGame(game);
    setEditingId(game.id);
    loadRegistrations(game.id);
    loadWaitlist(game.id);
    
    // Заполняем форму данными игры
    setFormData({
      name: game.name,
      startTime: convertUtcToLocalDate(game.startTime),
      endTime: game.endTime ? convertUtcToLocalDate(game.endTime) : null,
      price: game.price,
      rankMin: game.rankMin,
      rankMax: game.rankMax,
      maxUsers: game.maxUsers,
      description: game.description || '',
      courtId: game.court?.id || '',
      clubId: game.clubId || '',
      organizerId: game.organizer?.id || '',
    });
  };

  const handleCreate = async () => {
    try {
      if (!formData.startTime) {
        toast.error('Время начала обязательно');
        return;
      }
      
      const createData: CreateEvent = {
        name: formData.name,
        startTime: convertLocalDateToUtc(formData.startTime),
        endTime: formData.endTime ? convertLocalDateToUtc(formData.endTime) : undefined,
        price: formData.price,
        rankMin: formData.rankMin,
        rankMax: formData.rankMax,
        maxUsers: formData.maxUsers,
        description: formData.description || undefined,
        courtId: formData.courtId,
        clubId: formData.clubId,
        type: 'game',
        organizerId: formData.organizerId,
      };

      await eventsApi.create(createData);
      toast.success('Игра создана');
      
      await loadGames();
    } catch (error: unknown) {
      toast.error('Ошибка при создании игры');
      console.error('Error creating game:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      if (!formData.startTime) {
        toast.error('Время начала обязательно');
        return;
      }
      
      const updateData: AdminPatchEvent = {
        name: formData.name,
        startTime: convertLocalDateToUtc(formData.startTime),
        endTime: formData.endTime ? convertLocalDateToUtc(formData.endTime) : undefined,
        price: formData.price,
        rankMin: formData.rankMin,
        rankMax: formData.rankMax,
        maxUsers: formData.maxUsers,
        description: formData.description || undefined,
        courtId: formData.courtId,
        clubId: formData.clubId,
        organizerId: formData.organizerId,
      };

      await eventsApi.patch(id, updateData);
      toast.success('Игра обновлена');
      
      await loadGames();
    } catch (error: unknown) {
      toast.error('Ошибка при обновлении игры');
      console.error('Error updating game:', error);
    }
  };

  const handleDelete = async (game: Event) => {
    if (!window.confirm(`Вы уверены, что хотите удалить игру "${game.name}"?`)) {
      return;
    }

    try {
      await eventsApi.delete(game.id);
      toast.success('Игра удалена');
      await loadGames();
      
      // Если удаляем текущую редактируемую игру, сбрасываем форму
      if (editingId === game.id) {
        resetForm();
      }
    } catch (error: unknown) {
      toast.error('Ошибка при удалении игры');
      console.error('Error deleting game:', error);
    }
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setSelectedGame(null);
    setRegistrations([]);
    setWaitlist([]);
    setFormData({
      name: '',
      startTime: null,
      endTime: null,
      price: 0,
      rankMin: 0,
      rankMax: 7,
      maxUsers: 4,
      description: '',
      courtId: '',
      clubId: '',
      organizerId: '',
    });
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setSelectedGame(null);
    setRegistrations([]);
    setWaitlist([]);
    setFormData({
      name: '',
      startTime: null,
      endTime: null,
      price: 0,
      rankMin: 0,
      rankMax: 7,
      maxUsers: 4,
      description: '',
      courtId: '',
      clubId: '',
      organizerId: '',
    });
  };

  const handleInputChange = (field: string, value: string | number | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRankChange = (field: 'rankMin' | 'rankMax', levelIndex: number) => {
    const level = ratingLevels[levelIndex];
    if (field === 'rankMin') {
      setFormData(prev => ({ ...prev, rankMin: level.min }));
    } else {
      setFormData(prev => ({ ...prev, rankMax: level.max }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEdit) {
      toast.error('У вас нет прав для выполнения этого действия');
      return;
    }

    if (isCreating) {
      await handleCreate();
    } else if (editingId) {
      await handleUpdate(editingId);
    }
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Moscow'
      });
    } catch {
      return dateTime;
    }
  };

  const getClubName = (clubId: string) => {
    if (!clubId) return '';
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : clubId;
  };

  const getCourtName = (courtId: string) => {
    if (!courtId) return '';
    const court = courts.find(c => c.id === courtId);
    return court ? court.name : courtId;
  };

  const getAdminName = (userId: string) => {
    if (!userId) return '';
    const admin = admins.find(a => a.user_id === userId);
    return admin ? `${admin.user?.firstName} ${admin.user?.lastName}` : userId;
  };

  const getSelectedMinRatingLevel = () => {
    const level = ratingLevels.find(l => l.min === formData.rankMin);
    return level ? `${level.label} (${level.min} - ${level.max})` : `${formData.rankMin}`;
  };

  const getSelectedMaxRatingLevel = () => {
    const level = ratingLevels.find(l => l.max === formData.rankMax);
    return level ? `${level.label} (${level.min} - ${level.max})` : `${formData.rankMax}`;
  };

  const filteredGames = games.filter(game => {
    const nameMatch = !filters.name || game.name.toLowerCase().includes(filters.name.toLowerCase());
    const clubMatch = !filters.clubId || game.clubId === filters.clubId;
    const organizatorMatch = !filters.organizerId || game.organizer?.id === filters.organizerId;
    
    return nameMatch && clubMatch && organizatorMatch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-zinc-400 mt-2">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Форма создания/редактирования с табами */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between text-lg">
              {isCreating ? 'Создать игру' : editingId ? `Редактировать: ${selectedGame?.name}` : 'Форма управления'}
              {(isCreating || editingId) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isCreating || editingId ? (
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
                  <TabsTrigger value="edit" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">Редактирование</TabsTrigger>
                  <TabsTrigger 
                    value="participants" 
                    className={`data-[state=active]:bg-zinc-700 data-[state=active]:text-white ${!selectedGame ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                                              Участники ({registrations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length}/{selectedGame?.maxUsers})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="waiting" 
                    className={`data-[state=active]:bg-zinc-700 data-[state=active]:text-white ${!selectedGame ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    Список ожидания ({waitlist.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-4 mt-4">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <Label className="text-zinc-300 text-sm font-medium">Название</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 mt-1"
                        placeholder="Например: Игра в четверг"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-zinc-300 text-sm font-medium">Время начала</Label>
                        <div className="mt-1">
                          <DatePicker
                            selected={formData.startTime}
                            onChange={(date) => handleInputChange('startTime', date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="dd.MM.yyyy HH:mm"
                            locale="ru"
                            placeholderText="Выберите дату и время"
                            className="w-full h-10 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            calendarClassName="react-datepicker-dark"
                            popperClassName="react-datepicker-popper"
                            wrapperClassName="w-full"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-zinc-300 text-sm font-medium">Время окончания</Label>
                        <div className="mt-1">
                          <DatePicker
                            selected={formData.endTime}
                            onChange={(date) => handleInputChange('endTime', date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="dd.MM.yyyy HH:mm"
                            locale="ru"
                            placeholderText="Выберите дату и время"
                            className="w-full h-10 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            calendarClassName="react-datepicker-dark"
                            popperClassName="react-datepicker-popper"
                            wrapperClassName="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-zinc-300 text-sm font-medium">Цена (₽)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                          className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-300 text-sm font-medium">Макс. участников</Label>
                        <Input
                          type="number"
                          min="2"
                          value={formData.maxUsers}
                          onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value) || 2)}
                          className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-zinc-300 text-sm font-medium">Минимальный рейтинг</Label>
                        <Select value={formData.rankMin.toString()} onValueChange={(value) => handleRankChange('rankMin', parseInt(value))}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                            <SelectValue placeholder="Выберите минимальный рейтинг">
                              {getSelectedMinRatingLevel()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                            {ratingLevels.map((level, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {level.label} ({level.min} - {level.max})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-zinc-300 text-sm font-medium">Максимальный рейтинг</Label>
                        <Select value={formData.rankMax.toString()} onValueChange={(value) => handleRankChange('rankMax', parseInt(value))}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                            <SelectValue placeholder="Выберите максимальный рейтинг">
                              {getSelectedMaxRatingLevel()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                            {ratingLevels.map((level, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {level.label} ({level.min} - {level.max})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-zinc-300 text-sm font-medium">Клуб</Label>
                        <Select value={formData.clubId} onValueChange={(value) => handleInputChange('clubId', value)}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                            <SelectValue placeholder="Выберите клуб">
                              {getClubName(formData.clubId)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                            {clubs.map((club) => (
                              <SelectItem key={club.id} value={club.id}>
                                {club.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-zinc-300 text-sm font-medium">Корт</Label>
                        <Select value={formData.courtId} onValueChange={(value) => handleInputChange('courtId', value)}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                            <SelectValue placeholder="Выберите корт">
                              {getCourtName(formData.courtId)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                            {courts.map((court) => (
                              <SelectItem key={court.id} value={court.id}>
                                {court.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-zinc-300 text-sm font-medium">Организатор</Label>
                      <Select value={formData.organizerId} onValueChange={(value) => handleInputChange('organizerId', value)}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                          <SelectValue placeholder="Выберите организатора">
                            {getAdminName(formData.organizerId)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                          {admins.map((admin) => (
                            <SelectItem key={admin.id} value={admin.user_id}>
                              {admin.user?.firstName} {admin.user?.lastName} (@{admin.user?.telegramUsername})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-zinc-300 text-sm font-medium">Описание</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 mt-1 resize-none"
                        placeholder="Дополнительная информация об игре"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                        disabled={!canEdit}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isCreating ? 'Создать' : 'Сохранить'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Отмена
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="participants" className="space-y-4 mt-4">
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-green-400" />
                        Участники
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingRegistrations ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-zinc-400 mt-2">Загрузка регистраций...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {registrations.length === 0 ? (
                            <p className="text-zinc-400 text-center py-8">Нет участников</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Участник</TableHead>
                                  <TableHead>Telegram</TableHead>
                                  <TableHead>Рейтинг</TableHead>
                                  <TableHead>Статус</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                                              {registrations.map((registration, index) => (
                                <TableRow key={`${registration.userId}-${registration.eventId}-${index}`}>
                                    <TableCell className="text-white">
                                      {registration.user?.firstName} {registration.user?.lastName}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                      <a 
                                        href={`https://t.me/${registration.user?.telegramUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 hover:underline"
                                      >
                                        @{registration.user?.telegramUsername}
                                      </a>
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                      {registration.user?.rank || 0}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          registration.status === 'CONFIRMED' 
                                            ? 'bg-green-900/30 text-green-400' 
                                            : registration.status === 'PENDING'
                                            ? 'bg-yellow-900/30 text-yellow-400'
                                            : registration.status === 'INVITED'
                                            ? 'bg-blue-900/30 text-blue-400'
                                            : 'bg-red-900/30 text-red-400'
                                        }`}>
                                          {registration.status === 'CONFIRMED' ? 'Подтвержден' :
                                           registration.status === 'PENDING' ? 'Ожидание' :
                                           registration.status === 'INVITED' ? 'Приглашен' :
                                           registration.status === 'CANCELLED' ? 'Отменен' :
                                           registration.status === 'LEFT' ? 'Покинул' : registration.status}
                                        </span>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="waiting" className="space-y-4 mt-4">
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-400" />
                        Список ожидания
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingWaitlist ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-zinc-400 mt-2">Загрузка списка ожидания...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {waitlist.length === 0 ? (
                            <p className="text-zinc-400 text-center py-8">Список ожидания пуст</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Участник</TableHead>
                                  <TableHead>Telegram</TableHead>
                                  <TableHead>Рейтинг</TableHead>
                                  <TableHead>Город</TableHead>
                                  <TableHead>Дата добавления</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {waitlist.map((waitlistEntry, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="text-white">
                                      {waitlistEntry.user?.firstName} {waitlistEntry.user?.lastName}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                      @{waitlistEntry.user?.telegramUsername}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                      {waitlistEntry.user?.rank || 0}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                      {waitlistEntry.user?.city || '-'}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                      {new Date(waitlistEntry.date).toLocaleDateString('ru-RU')}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <Gamepad2 className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">Выберите игру для редактирования или создайте новую</p>
                <Button
                  onClick={startCreate}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!canEdit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать игру
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Список игр */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between text-lg">
              <span>Игры ({filteredGames.length})</span>
              {canEdit && (
                <Button
                  size="sm"
                  onClick={startCreate}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Создать
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Фильтры */}
            <div className="space-y-3 mb-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-zinc-300 text-sm">Поиск по названию</Label>
                  <Input
                    value={filters.name}
                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500 mt-1"
                    placeholder="Введите название игры"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300 text-sm">Клуб</Label>
                  <Select value={filters.clubId} onValueChange={(value) => setFilters(prev => ({ ...prev, clubId: value }))}>
                    <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white mt-1">
                      <SelectValue placeholder="Все клубы">
                        {filters.clubId ? getClubName(filters.clubId) : 'Все клубы'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectItem value="">Все клубы</SelectItem>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300 text-sm">Организатор</Label>
                  <Select value={filters.organizerId} onValueChange={(value) => setFilters(prev => ({ ...prev, organizerId: value }))}>
                    <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white mt-1">
                      <SelectValue placeholder="Все организаторы">
                        {filters.organizerId ? getAdminName(filters.organizerId) : 'Все организаторы'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectItem value="">Все организаторы</SelectItem>
                      {admins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.user_id}>
                          {admin.user?.firstName} {admin.user?.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {filteredGames.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">Игры не найдены</p>
                {canEdit && (
                  <Button
                    onClick={startCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Создать первую игру
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {filteredGames.map((game) => (
                    <div
                      key={game.id}
                      className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        editingId === game.id
                          ? 'bg-green-900/30 border-green-600' 
                          : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-750 hover:border-zinc-600'
                      }`}
                      onClick={() => handleGameSelect(game)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white text-sm md:text-base line-clamp-1">
                              {game.name}
                            </h3>
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                              Игра
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDateTime(game.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                              <MapPin className="h-3 w-3" />
                              <span>{getCourtName(game.court?.id || '') || 'Корт не указан'}</span>
                            </div>
                          </div>

                          {game.description && (
                            <p className="text-zinc-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mt-2">{game.description}</p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                              {getClubName(game.clubId || '')}
                            </Badge>
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                              {game.price}₽
                            </Badge>
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                              {getRatingRangeDescription(game.rankMin, game.rankMax)}
                            </Badge>
                          </div>

                          <div className="mt-3">
                            <StatusSelector
                              currentStatus={game.status}
                              eventId={game.id}
                              onStatusChange={handleEventStatusChange}
                              disabled={!canEdit}
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigateToRegistrations) {
                                onNavigateToRegistrations(game.id, game.name);
                              }
                            }}
                            className="bg-purple-600 border-purple-500 hover:bg-purple-700 text-white h-8 px-2"
                          >
                            <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            Регистрации
                          </Button>
                          {canEdit && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGameSelect(game);
                                }}
                                className="bg-blue-600 border-blue-500 hover:bg-blue-700 text-white h-8 px-2"
                              >
                                <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                Редактировать
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(game);
                                }}
                                className="bg-red-600 border-red-500 hover:bg-red-700 text-white h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 