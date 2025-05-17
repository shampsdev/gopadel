import { useState, useEffect } from 'react';
import type { Tournament } from '../shared/types';

interface TournamentFormProps {
  tournament?: Tournament;
  onSave: (tournament: Tournament) => void;
}

const defaultTournament: Tournament = {
  name: '',
  start_time: new Date().toISOString().slice(0, 16),
  price: 0,
  location: '',
  rank_min: 0,
  rank_max: 5,
  max_users: 0
};

const TournamentForm = ({ tournament, onSave }: TournamentFormProps) => {
  const [formData, setFormData] = useState<Tournament>(tournament || defaultTournament);
  const [errors, setErrors] = useState<Partial<Record<keyof Tournament, string>>>({});

  useEffect(() => {
    if (tournament) {
      // Convert ISO string to local datetime-local format
      const formattedTournament = {
        ...tournament,
        start_time: tournament.start_time.slice(0, 16) // Format for datetime-local input
      };
      setFormData(formattedTournament);
    } else {
      setFormData(defaultTournament);
    }
  }, [tournament]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Tournament, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название турнира обязательно';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Локация обязательна';
    }
    
    if (formData.max_users <= 0) {
      newErrors.max_users = 'Максимальное количество участников должно быть больше 0';
    }

    if (formData.rank_min < 0) {
      newErrors.rank_min = 'Минимальный ранг не может быть отрицательным';
    }

    if (formData.rank_max < formData.rank_min) {
      newErrors.rank_max = 'Максимальный ранг должен быть не меньше минимального';
    }

    if (formData.price < 0) {
      newErrors.price = 'Цена не может быть отрицательной';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Format datetime to ISO string for API
      const tournamentToSave = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString()
      };
      onSave(tournamentToSave);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <label className="block text-gray-700 mb-1">Дата и время начала</label>
        <input
          type="datetime-local"
          name="start_time"
          value={formData.start_time}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Стоимость участия</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Локация</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-1">Минимальный ранг</label>
          <input
            type="number"
            name="rank_min"
            value={formData.rank_min}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${errors.rank_min ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.rank_min && <p className="text-red-500 text-sm mt-1">{errors.rank_min}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Максимальный ранг</label>
          <input
            type="number"
            name="rank_max"
            value={formData.rank_max}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${errors.rank_max ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.rank_max && <p className="text-red-500 text-sm mt-1">{errors.rank_max}</p>}
        </div>
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Максимальное количество участников</label>
        <input
          type="number"
          name="max_users"
          value={formData.max_users}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${errors.max_users ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.max_users && <p className="text-red-500 text-sm mt-1">{errors.max_users}</p>}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Сохранить
        </button>
      </div>
    </form>
  );
};

export default TournamentForm; 