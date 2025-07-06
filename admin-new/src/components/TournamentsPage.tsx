import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Edit, Trash2, Save, X, Trophy, Calendar, Users, MapPin, User } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale/ru';
import "react-datepicker/dist/react-datepicker.css";
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { tournamentsApi, type Tournament, type CreateTournament, type AdminPatchTournament } from '../api/tournaments';
import { clubsApi, type Club } from '../api/clubs';
import { courtsApi, type Court } from '../api/courts';
import { adminsApi } from '../api/admins';
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
      toast.success('Турнир успешно создан');
      
      resetForm();
      loadTournaments();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : undefined;
      toast.error(errorMessage || 'Ошибка при создании турнира');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const tournamentType = isCustomTournamentType ? formData.customTournamentType : formData.tournamentType;
      
      if (!formData.startTime) {
        toast.error('Время начала обязательно');
        return;
      }
      
      const patchData: AdminPatchTournament = {
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

      await tournamentsApi.patch(id, patchData);
      toast.success('Турнир успешно обновлен');
      
      resetForm();
      loadTournaments();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : undefined;
      toast.error(errorMessage || 'Ошибка при обновлении турнира');
    }
  };

  const handleDelete = async (tournament: Tournament) => {
    if (!confirm(`Вы уверены, что хотите удалить турнир "${tournament.name}"?`)) {
      return;
    }

    try {
      await tournamentsApi.delete(tournament.id);
      toast.success('Турнир успешно удален');
      loadTournaments();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : undefined;
      toast.error(errorMessage || 'Ошибка при удалении турнира');
    }
  };

  const startEdit = (tournament: Tournament) => {
    setEditingId(tournament.id);
    setIsCreating(false);
    
    // Проверяем, является ли тип турнира кастомным
    const isCustomType = !tournamentTypes.some(t => t.value === tournament.tournamentType);
    setIsCustomTournamentType(isCustomType);
    
    setFormData({
      name: tournament.name,
      startTime: convertUtcToLocalDate(tournament.startTime),
      endTime: tournament.endTime ? convertUtcToLocalDate(tournament.endTime) : null,
      price: tournament.price,
      rankMin: tournament.rankMin,
      rankMax: tournament.rankMax,
      maxUsers: tournament.maxUsers,
      description: tournament.description || '',
      courtId: tournament.court.id,
      clubId: tournament.clubId,
      tournamentType: isCustomType ? 'custom' : tournament.tournamentType,
      customTournamentType: isCustomType ? tournament.tournamentType : '',
      organizatorId: tournament.organizator.id,
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setIsCustomTournamentType(false);
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
      tournamentType: 'americano',
      customTournamentType: '',
      organizatorId: '',
    });
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setIsCustomTournamentType(false);
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
      tournamentType: 'americano',
      customTournamentType: '',
      organizatorId: '',
    });
  };

  const handleInputChange = (field: string, value: string | number | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTournamentTypeChange = (value: string) => {
    setIsCustomTournamentType(value === 'custom');
    handleInputChange('tournamentType', value);
    if (value !== 'custom') {
      handleInputChange('customTournamentType', '');
    }
  };

  const handleRankChange = (field: 'rankMin' | 'rankMax', levelIndex: number) => {
    const level = ratingLevels[levelIndex];
    if (field === 'rankMin') {
      handleInputChange('rankMin', level.min);
      // Если минимальный рейтинг больше максимального, устанавливаем максимальный на верхнюю границу выбранного уровня
      if (level.min > formData.rankMax) {
        handleInputChange('rankMax', level.max);
      }
    } else {
      handleInputChange('rankMax', level.max);
      // Если максимальный рейтинг меньше минимального, устанавливаем минимальный на нижнюю границу выбранного уровня
      if (level.max < formData.rankMin) {
        handleInputChange('rankMin', level.min);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Название турнира обязательно');
      return;
    }

    if (!formData.startTime) {
      toast.error('Время начала обязательно');
      return;
    }

    if (!formData.courtId) {
      toast.error('Корт обязателен');
      return;
    }

    if (!formData.clubId) {
      toast.error('Клуб обязателен');
      return;
    }

    if (!formData.organizatorId) {
      toast.error('Организатор обязателен');
      return;
    }

    if (isCustomTournamentType && !formData.customTournamentType.trim()) {
      toast.error('Введите тип турнира');
      return;
    }

    if (isCreating) {
      await handleCreate();
    } else if (editingId) {
      await handleUpdate(editingId);
    }
  };

  const formatDateTime = (dateTime: string) => {
    // Создаем дату из UTC строки и форматируем в локальном времени
    const utcDate = new Date(dateTime);
    
    return utcDate.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClubName = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    return club?.name || clubId;
  };

  const getCourtName = (courtId: string) => {
    const court = courts.find(c => c.id === courtId);
    return court?.name || courtId;
  };

  const getAdminName = (adminId: string) => {
    const admin = admins.find(a => a.user?.id === adminId);
    return admin?.user ? `${admin.user.firstName} ${admin.user.lastName}` : adminId;
  };

  const getTournamentTypeName = (type: string) => {
    const predefinedType = tournamentTypes.find(t => t.value === type);
    return predefinedType?.label || type;
  };

  const getSelectedMinRatingLevel = () => {
    const level = ratingLevels.find(l => l.min === formData.rankMin);
    return level ? level.label : `${formData.rankMin}`;
  };

  const getSelectedMaxRatingLevel = () => {
    const level = ratingLevels.find(l => l.max === formData.rankMax);
    return level ? level.label : `${formData.rankMax}`;
  };

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
        {/* Форма создания/редактирования */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between text-lg">
              {isCreating ? 'Создать турнир' : editingId ? 'Редактировать турнир' : 'Форма управления'}
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
                        <SelectItem key={admin.id} value={admin.user!.id}>
                          {admin.user!.firstName} {admin.user!.lastName} (@{admin.user!.telegramUsername})
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
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[60px] mt-1 resize-none"
                    placeholder="Описание турнира"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 pt-2">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? 'Создать' : 'Сохранить'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white flex-1 sm:flex-none"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 md:py-8">
                <p className="text-zinc-400 mb-4 text-sm md:text-base">
                  {canEdit 
                    ? "Выберите турнир для редактирования или создайте новый"
                    : "Только администраторы могут управлять турнирами"
                  }
                </p>
                {canEdit && (
                  <Button
                    onClick={startCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Создать турнир
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Список турниров */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between text-lg">
              Турниры
              <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                {tournaments.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {tournaments.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-zinc-400 text-sm md:text-base">Нет турниров</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] md:h-[400px] lg:h-[600px]">
                <div className="space-y-3 md:space-y-4 pr-3">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className={`p-3 md:p-4 rounded-lg border transition-colors cursor-pointer ${
                        editingId === tournament.id
                          ? 'border-green-600 bg-green-600/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                      onClick={() => canEdit && startEdit(tournament)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <h3 className="text-white font-medium text-base md:text-lg truncate flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                              {tournament.name}
                            </h3>
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs w-fit">
                              {getTournamentTypeName(tournament.tournamentType)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-xs md:text-sm text-zinc-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDateTime(tournament.startTime)}</span>
                              {tournament.endTime && (
                                <span>- {formatDateTime(tournament.endTime)}</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{getCourtName(tournament.court.id)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>{tournament.organizator.firstName} {tournament.organizator.lastName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              <span>{tournament.participants?.length || 0}/{tournament.maxUsers} участников</span>
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
                                startEdit(tournament);
                              }}
                              className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3 md:h-4 md:w-4" />
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