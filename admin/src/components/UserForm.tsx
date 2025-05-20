import { useState, useEffect } from 'react';
import type { User, Loyalty } from '../shared/types';

interface UserFormProps {
  user: User;
  loyalties: Loyalty[];
  onSave: (user: Partial<User>) => void;
}

const UserForm = ({ user, loyalties, onSave }: UserFormProps) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});

  useEffect(() => {
    setFormData({
      first_name: user.first_name,
      second_name: user.second_name,
      birth_date: user.birth_date ? user.birth_date.split('T')[0] : undefined,
      city: user.city,
      rank: user.rank,
      loyalty_id: user.loyalty_id,
      is_registered: user.is_registered
    });
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof User, string>> = {};
    
    if (formData.first_name !== undefined && !formData.first_name.trim()) {
      newErrors.first_name = 'Имя обязательно';
    }
    
    if (formData.second_name !== undefined && !formData.second_name.trim()) {
      newErrors.second_name = 'Фамилия обязательна';
    }

    if (formData.rank !== undefined && (formData.rank < 0 || formData.rank > 5)) {
      newErrors.rank = 'Рейтинг должен быть от 0 до 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' || name === 'loyalty_id' ? Number(value) : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-1">Имя</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Фамилия</label>
          <input
            type="text"
            name="second_name"
            value={formData.second_name || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${errors.second_name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.second_name && <p className="text-red-500 text-sm mt-1">{errors.second_name}</p>}
        </div>
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Город</label>
        <input
          type="text"
          name="city"
          value={formData.city || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Дата рождения</label>
        <input
          type="date"
          name="birth_date"
          value={formData.birth_date || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Рейтинг</label>
        <input
          type="number"
          name="rank"
          step="0.1"
          min="0"
          max="5"
          value={formData.rank === undefined ? '' : formData.rank}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${errors.rank ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.rank && <p className="text-red-500 text-sm mt-1">{errors.rank}</p>}
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Уровень лояльности</label>
        <select
          name="loyalty_id"
          value={formData.loyalty_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          {loyalties.map(loyalty => (
            <option key={loyalty.id} value={loyalty.id}>
              {loyalty.name} ({loyalty.discount}%)
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="is_registered"
          type="checkbox"
          name="is_registered"
          checked={formData.is_registered || false}
          onChange={handleChange}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="is_registered" className="ml-2 block text-sm text-gray-700">
          Зарегистрирован
        </label>
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

export default UserForm; 