import { useState, useEffect } from 'react';
import type { Tournament, User, Club } from '../shared/types';
import { userService } from '../services/user';
import { clubService } from '../services/club';
import { useUser } from '../context/UserContext';
import { adminService } from '../services/admin';
import { getRatingRangeDescription } from '../utils/ratingUtils';
import RatingLevelSelector from './RatingLevelSelector';

interface TournamentFormProps {
  tournament?: Tournament;
  onSave: (tournament: Tournament) => void;
}

const defaultTournament: Tournament = {
  name: '',
  start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
  end_time: '',
  price: 0,
  club_id: '',
  tournament_type: '',
  rank_min: 0,
  rank_max: 7,
  max_users: 0,
  description: '',
  organizator_id: ''
};

const TournamentForm = ({ tournament, onSave }: TournamentFormProps) => {
  const [formData, setFormData] = useState<Tournament>(tournament || defaultTournament);
  const [errors, setErrors] = useState<Partial<Record<keyof Tournament | 'club_id' | 'tournament_type', string>>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const { currentAdmin } = useUser();
  const [currentAdminUserId, setCurrentAdminUserId] = useState<string | null>(null);
  
  // New states for tournament type handling
  const [isCustomType, setIsCustomType] = useState(false);
  const [customTypeValue, setCustomTypeValue] = useState('');

  const tournamentTypes = [
    { value: 'Американо', label: 'Американо' },
    { value: 'Мексиканка', label: 'Мексиканка' },
    { value: 'Без типа', label: 'Без типа' },
  ];

  useEffect(() => {
    if (tournament) {
      // Since the server now handles Moscow timezone correctly,
      // we can display the time as is for datetime-local input
      const formattedTournament = {
        ...tournament,
        start_time: tournament.start_time.slice(0, 16), // Remove timezone info for datetime-local
        end_time: tournament.end_time ? tournament.end_time.slice(0, 16) : ''
      };
      setFormData(formattedTournament);
      
      // Check if tournament type is custom (not in predefined list)
      const isPredefined = tournamentTypes.some(type => type.value === tournament.tournament_type);
      if (!isPredefined && tournament.tournament_type) {
        setIsCustomType(true);
        setCustomTypeValue(tournament.tournament_type);
      }
    } else {
      // For new tournaments, set the default values
      setFormData({
        ...defaultTournament,
        // If we have already fetched the admin's user and it exists, use it as default
        organizator_id: currentAdminUserId || defaultTournament.organizator_id
      });
    }
  }, [tournament, currentAdminUserId]);

  // Fetch the current admin's full profile to get user_id
  useEffect(() => {
    const fetchCurrentAdminProfile = async () => {
      if (!currentAdmin?.username) return;
      
      try {
        // Get all admins
        const admins = await adminService.getAll();
        // Find the current admin by username
        const foundAdmin = admins.find(admin => admin.username === currentAdmin.username);
        
        // If found and has a user_id, set it
        if (foundAdmin && foundAdmin.user_id) {
          setCurrentAdminUserId(foundAdmin.user_id);
          
          // If creating a new tournament, set the organizator_id
          if (!tournament) {
            setFormData(prev => ({
              ...prev,
              organizator_id: foundAdmin.user_id as string
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch current admin profile:', error);
      }
    };
    
    fetchCurrentAdminProfile();
  }, [currentAdmin, tournament]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { users } = await userService.getAll(0, 1000);
        setUsers(users);
      } catch {
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoadingClubs(true);
      try {
        const clubsData = await clubService.getAll();
        setClubs(clubsData);
      } catch {
        setClubs([]);
      } finally {
        setLoadingClubs(false);
      }
    };
    fetchClubs();
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Tournament | 'club_id' | 'tournament_type', string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название турнира обязательно';
    }
    
    if (!formData.club_id) {
      newErrors.club_id = 'Клуб обязателен';
    }

    if (!formData.tournament_type) {
      newErrors.tournament_type = 'Тип турнира обязателен';
    }
    
    if (formData.max_users <= 0) {
      newErrors.max_users = 'Максимальное количество участников должно быть больше 0';
    }

    if (formData.price < 0) {
      newErrors.price = 'Цена не может быть отрицательной';
    }

    // Check if start time is in the past (only for new tournaments)
    if (!tournament && formData.start_time) {
      const selectedDate = new Date(formData.start_time);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.start_time = 'Предупреждение: Выбрана дата из прошлого';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Special handling for tournament type
    if (name === 'tournament_type') {
      if (value === 'custom') {
        setIsCustomType(true);
        setFormData({
          ...formData,
          tournament_type: customTypeValue
        });
      } else {
        setIsCustomType(false);
        setFormData({
          ...formData,
          tournament_type: value
        });
      }
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Since the server now handles Moscow timezone correctly,
      // we can send the datetime-local value as is
      
      // Ensure all number fields have valid values (default to 0 if undefined)
      const tournamentToSave = {
        ...formData,
        price: formData.price ?? 0,
        rank_min: formData.rank_min ?? 0,
        rank_max: formData.rank_max ?? 0,
        max_users: formData.max_users ?? 0,
        start_time: formData.start_time, // Send as is - server will handle Moscow timezone
        end_time: formData.end_time || undefined,
        description: formData.description || undefined
      };
      onSave(tournamentToSave);
    }
  };

  // Handler for custom tournament type input
  const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomTypeValue(value);
    setFormData({
      ...formData,
      tournament_type: value
    });
  };

  // Handler to switch back to predefined types
  const handleBackToPresets = () => {
    setIsCustomType(false);
    setCustomTypeValue('');
    setFormData({
      ...formData,
      tournament_type: ''
    });
  };

  const handleRatingChange = (minRating: number, maxRating: number) => {
    setFormData({
      ...formData,
      rank_min: minRating,
      rank_max: maxRating
    });
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-gray-700 mb-1">Название</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Дата и время начала</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.start_time ? 'border-orange-500' : 'border-gray-300'}`}
            />
            <p className="text-xs text-gray-500 mt-1">Время указывается по Москве (UTC+3)</p>
            {errors.start_time && <p className="text-orange-600 text-sm mt-1">{errors.start_time}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Дата и время окончания (опционально)</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Стоимость участия</label>
            <input
              type="number"
              name="price"
              value={formData.price === undefined ? '' : formData.price}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Макс. участников</label>
            <input
              type="number"
              name="max_users"
              value={formData.max_users === undefined ? '' : formData.max_users}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.max_users ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.max_users && <p className="text-red-500 text-sm mt-1">{errors.max_users}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Организатор</label>
            <select
              name="organizator_id"
              value={formData.organizator_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={loadingUsers}
            >
              <option value="">Выберите организатора</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.second_name} {user.username ? `(@${user.username})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Клуб</label>
            <select
              name="club_id"
              value={formData.club_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.club_id ? 'border-red-500' : 'border-gray-300'}`}
              disabled={loadingClubs}
            >
              <option value="">Выберите клуб</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
            {errors.club_id && <p className="text-red-500 text-sm mt-1">{errors.club_id}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Тип турнира</label>
            {!isCustomType ? (
              <div className="space-y-2">
                <select
                  name="tournament_type"
                  value={formData.tournament_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded ${errors.tournament_type ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Выберите тип турнира</option>
                  {tournamentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                  <option value="custom">Свой вариант...</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTypeValue}
                    onChange={handleCustomTypeChange}
                    placeholder="Введите тип турнира"
                    className={`flex-1 px-3 py-2 border rounded ${errors.tournament_type ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={handleBackToPresets}
                    className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                    title="Вернуться к списку"
                  >
                    ↺
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Введите свой вариант типа турнира или нажмите ↺ чтобы выбрать из списка
                </p>
              </div>
            )}
            {errors.tournament_type && <p className="text-red-500 text-sm mt-1">{errors.tournament_type}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <RatingLevelSelector
            minRating={formData.rank_min ?? 0}
            maxRating={formData.rank_max ?? 7}
            onChange={handleRatingChange}
            error={errors.rank_min || errors.rank_max}
          />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">
            Диапазон рейтинга: {getRatingRangeDescription(formData.rank_min ?? 0, formData.rank_max ?? 7)}
          </p>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Описание (опционально)</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Описание турнира, что будет, особенности..."
            className="w-full px-3 py-2 border border-gray-300 rounded resize-vertical"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
};

export default TournamentForm; 