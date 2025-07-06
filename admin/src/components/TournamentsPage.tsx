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
import { Plus, Edit, Trash2, Save, X, Trophy, Calendar, MapPin, UserCheck, Clock } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale/ru';
import "react-datepicker/dist/react-datepicker.css";
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { tournamentsApi, type Tournament, type CreateTournament, type AdminPatchTournament } from '../api/tournaments';
import { clubsApi, type Club } from '../api/clubs';
import { courtsApi, type Court } from '../api/courts';
import { adminsApi } from '../api/admins';
import { registrationsApi, type RegistrationWithPayments, type RegistrationStatus } from '../api/registrations';
import { waitlistApi, type WaitlistUser } from '../api/waitlist';
import type { AdminUser } from '../types/admin';
import { ratingLevels, getRatingRangeDescription } from '../utils/ratingUtils';

// Регистрируем русскую локаль для DatePicker
registerLocale('ru', ru);

export const TournamentsPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCustomTournamentType, setIsCustomTournamentType] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithPayments[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [waitlist, setWaitlist] = useState<WaitlistUser[]>([]);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    clubId: '',
    organizatorId: '',
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
    tournamentType: 'tournament',
    customTournamentType: '',
    organizatorId: '',
  });

  const toast = useToastContext();
  const { user } = useAuth();
  
  // Проверяем права доступа
  const canEdit = user?.is_superuser || user?.is_active || false;

  // Предустановленные типы турниров
  const tournamentTypes = [
    { value: 'americano', label: 'Американо' },
    { value: 'mexicano', label: 'Мексиканка' },
    { value: 'training', label: 'Тренировка' },
    { value: 'custom', label: 'Ввести вручную' }
  ];

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
        loadTournaments(),
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

  const loadTournaments = async () => {
    try {
      const data = await tournamentsApi.getAll();
      setTournaments(data);
    } catch (error: unknown) {
      toast.error('Ошибка при загрузке турниров');
      console.error('Error loading tournaments:', error);
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

  const loadRegistrations = async (tournamentId: string) => {
    setLoadingRegistrations(true);
    try {
      const data = await registrationsApi.filter({ tournamentId });
      setRegistrations(data);
    } catch (error: unknown) {
      toast.error('Ошибка при загрузке регистраций');
      console.error('Error loading registrations:', error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const loadWaitlist = async (tournamentId: string) => {
    setLoadingWaitlist(true);
    try {
      const data = await waitlistApi.getTournamentWaitlist(tournamentId);
      setWaitlist(data);
    } catch (error: unknown) {
      toast.error('Ошибка при загрузке списка ожидания');
      console.error('Error loading waitlist:', error);
    } finally {
      setLoadingWaitlist(false);
    }
  };

  const handleStatusChange = async (registrationId: string, newStatus: RegistrationStatus) => {
    try {
      await registrationsApi.updateStatus(registrationId, newStatus);
      toast.success('Статус регистрации обновлен');
      
      // Обновляем локальное состояние
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: newStatus }
            : reg
        )
      );
    } catch (error: unknown) {
      toast.error('Ошибка при изменении статуса');
      console.error('Error updating registration status:', error);
    }
  };

  const handleTournamentSelect = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setEditingId(tournament.id);
    loadRegistrations(tournament.id);
    loadWaitlist(tournament.id);
    
    // Заполняем форму данными турнира
    setFormData({
      name: tournament.name,
      startTime: convertUtcToLocalDate(tournament.startTime),
      endTime: tournament.endTime ? convertUtcToLocalDate(tournament.endTime) : null,
      price: tournament.price,
      rankMin: tournament.rankMin,
      rankMax: tournament.rankMax,
      maxUsers: tournament.maxUsers,
      description: tournament.description || '',
      courtId: tournament.court?.id || '',
      clubId: tournament.clubId,
      tournamentType: tournament.tournamentType,
      customTournamentType: '',
      organizatorId: tournament.organizator?.id || '',
    });
    
    // Проверяем, нужно ли показывать поле для кастомного типа
    const isCustomType = !tournamentTypes.some(t => t.value === tournament.tournamentType);
    setIsCustomTournamentType(isCustomType);
    if (isCustomType) {
      setFormData(prev => ({
        ...prev,
        customTournamentType: tournament.tournamentType
      }));
    }
  };

  const handleCreate = async () => {
    try {
      const tournamentType = isCustomTournamentType ? formData.customTournamentType : formData.tournamentType;
      
      if (!formData.startTime) {
        toast.error('Время начала обязательно');
        return;
      }
      
      const createData: CreateTournament = {
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
        tournamentType: tournamentType,
        organizatorId: formData.organizatorId,
      };

      await tournamentsApi.create(createData);
      toast.success('Турнир создан');
      
      await loadTournaments();
    } catch (error: unknown) {
      toast.error('Ошибка при создании турнира');
      console.error('Error creating tournament:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const tournamentType = isCustomTournamentType ? formData.customTournamentType : formData.tournamentType;
      
      if (!formData.startTime) {
        toast.error('Время начала обязательно');
        return;
      }
      
      const updateData: AdminPatchTournament = {
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
        tournamentType: tournamentType,
        organizatorId: formData.organizatorId,
      };

      await tournamentsApi.patch(id, updateData);
      toast.success('Турнир обновлен');
      
      await loadTournaments();
    } catch (error: unknown) {
      toast.error('Ошибка при обновлении турнира');
      console.error('Error updating tournament:', error);
    }
  };

  const handleDelete = async (tournament: Tournament) => {
    if (!window.confirm(`Вы уверены, что хотите удалить турнир "${tournament.name}"?`)) {
      return;
    }

    try {
      await tournamentsApi.delete(tournament.id);
      toast.success('Турнир удален');
      await loadTournaments();
      
      // Если удаляем текущий редактируемый турнир, сбрасываем форму
      if (editingId === tournament.id) {
        resetForm();
      }
    } catch (error: unknown) {
      toast.error('Ошибка при удалении турнира');
      console.error('Error deleting tournament:', error);
    }
  };



  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setSelectedTournament(null);
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
      tournamentType: 'tournament',
      customTournamentType: '',
      organizatorId: '',
    });
    setIsCustomTournamentType(false);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setSelectedTournament(null);
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
      tournamentType: 'tournament',
      customTournamentType: '',
      organizatorId: '',
    });
    setIsCustomTournamentType(false);
  };

  const handleInputChange = (field: string, value: string | number | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTournamentTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, tournamentType: value }));
    setIsCustomTournamentType(value === 'custom');
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
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : clubId;
  };

  const getCourtName = (courtId: string) => {
    const court = courts.find(c => c.id === courtId);
    return court ? court.name : courtId;
  };

  const getAdminName = (userId: string) => {
    const admin = admins.find(a => a.user_id === userId);
    return admin ? `${admin.user?.firstName} ${admin.user?.lastName}` : userId;
  };

  const getTournamentTypeName = (type: string) => {
    const tournamentType = tournamentTypes.find(t => t.value === type);
    return tournamentType ? tournamentType.label : type;
  };

  const getSelectedMinRatingLevel = () => {
    const level = ratingLevels.find(l => l.min === formData.rankMin);
    return level ? `${level.label} (${level.min} - ${level.max})` : `${formData.rankMin}`;
  };

  const getSelectedMaxRatingLevel = () => {
    const level = ratingLevels.find(l => l.max === formData.rankMax);
    return level ? `${level.label} (${level.min} - ${level.max})` : `${formData.rankMax}`;
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const nameMatch = !filters.name || tournament.name.toLowerCase().includes(filters.name.toLowerCase());
    const clubMatch = !filters.clubId || tournament.clubId === filters.clubId;
    const organizatorMatch = !filters.organizatorId || tournament.organizator?.id === filters.organizatorId;
    
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
              {isCreating ? 'Создать турнир' : editingId ? `Редактировать: ${selectedTournament?.name}` : 'Форма управления'}
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="edit">Редактирование</TabsTrigger>
                  <TabsTrigger value="participants" className={!selectedTournament ? 'opacity-50 pointer-events-none' : ''}>
                    Участники ({registrations.filter(r => r.status === 'ACTIVE' || r.status === 'PENDING').length}/{selectedTournament?.maxUsers})
                  </TabsTrigger>
                  <TabsTrigger value="waiting" className={!selectedTournament ? 'opacity-50 pointer-events-none' : ''}>
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
                    placeholder="Например: Турнир выходного дня"
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

                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Тип турнира</Label>
                  <Select value={formData.tournamentType} onValueChange={handleTournamentTypeChange}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                      <SelectValue placeholder="Выберите тип турнира">
                        {getTournamentTypeName(formData.tournamentType)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {tournamentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isCustomTournamentType && (
                  <div>
                    <Label className="text-zinc-300 text-sm font-medium">Введите тип турнира</Label>
                    <Input
                      value={formData.customTournamentType}
                      onChange={(e) => handleInputChange('customTournamentType', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 mt-1"
                      placeholder="Например: Круговая система"
                      required
                    />
                  </div>
                )}

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
                  <Select value={formData.organizatorId} onValueChange={(value) => handleInputChange('organizatorId', value)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                      <SelectValue placeholder="Выберите организатора">
                        {getAdminName(formData.organizatorId)}
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
                        placeholder="Дополнительная информация о турнире"
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
                                {registrations.map((registration) => (
                                  <TableRow key={registration.id}>
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
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant={registration.status === 'ACTIVE' ? 'default' : 'outline'}
                                          onClick={() => handleStatusChange(registration.id, 'ACTIVE')}
                                          className={`h-7 px-2 text-xs ${
                                            registration.status === 'ACTIVE' 
                                              ? 'bg-green-600 border-green-500 hover:bg-green-700 text-white' 
                                              : 'bg-zinc-700 border-zinc-600 hover:bg-green-600 hover:border-green-500 text-zinc-300 hover:text-white'
                                          }`}
                                        >
                                          Активен
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={registration.status === 'PENDING' ? 'default' : 'outline'}
                                          onClick={() => handleStatusChange(registration.id, 'PENDING')}
                                          className={`h-7 px-2 text-xs ${
                                            registration.status === 'PENDING' 
                                              ? 'bg-yellow-600 border-yellow-500 hover:bg-yellow-700 text-white' 
                                              : 'bg-zinc-700 border-zinc-600 hover:bg-yellow-600 hover:border-yellow-500 text-zinc-300 hover:text-white'
                                          }`}
                                        >
                                          Ожидание
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={registration.status === 'CANCELED' ? 'default' : 'outline'}
                                          onClick={() => handleStatusChange(registration.id, 'CANCELED')}
                                          className={`h-7 px-2 text-xs ${
                                            registration.status === 'CANCELED' 
                                              ? 'bg-red-600 border-red-500 hover:bg-red-700 text-white' 
                                              : 'bg-zinc-700 border-zinc-600 hover:bg-red-600 hover:border-red-500 text-zinc-300 hover:text-white'
                                          }`}
                                        >
                                          Отменен
                                        </Button>
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
                <Trophy className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">Выберите турнир для редактирования или создайте новый</p>
                  <Button
                    onClick={startCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!canEdit}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Создать турнир
                  </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Список турниров */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between text-lg">
              <span>Турниры ({filteredTournaments.length})</span>
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
                    placeholder="Введите название турнира"
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
                  <Select value={filters.organizatorId} onValueChange={(value) => setFilters(prev => ({ ...prev, organizatorId: value }))}>
                    <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white mt-1">
                      <SelectValue placeholder="Все организаторы">
                        {filters.organizatorId ? getAdminName(filters.organizatorId) : 'Все организаторы'}
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
            
            {filteredTournaments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">Турниры не найдены</p>
                {canEdit && (
                  <Button
                    onClick={startCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Создать первый турнир
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {filteredTournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                                             className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        editingId === tournament.id
                           ? 'bg-green-900/30 border-green-600' 
                           : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-750 hover:border-zinc-600'
                      }`}
                      onClick={() => handleTournamentSelect(tournament)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white text-sm md:text-base line-clamp-1">
                              {tournament.name}
                            </h3>
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                              {getTournamentTypeName(tournament.tournamentType)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDateTime(tournament.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                              <MapPin className="h-3 w-3" />
                              <span>{getCourtName(tournament.court?.id || '')}</span>
                            </div>
                          </div>

                          {tournament.description && (
                            <p className="text-zinc-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mt-2">{tournament.description}</p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                              {getClubName(tournament.clubId)}
                            </Badge>
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                              {tournament.price}₽
                            </Badge>
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                              {getRatingRangeDescription(tournament.rankMin, tournament.rankMax)}
                            </Badge>
                          </div>
                        </div>
                        
                        {canEdit && (
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTournamentSelect(tournament);
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
                                handleDelete(tournament);
                              }}
                              className="bg-red-600 border-red-500 hover:bg-red-700 text-white h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </div>
                        )}
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