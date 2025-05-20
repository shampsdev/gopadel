import { useState, useEffect } from 'react';
import type { Loyalty } from '../shared/types';

interface LoyaltyFormProps {
  loyalty?: Loyalty;
  onSave: (loyalty: Loyalty) => void;
}

const defaultLoyalty: Loyalty = {
  name: '',
  discount: 0,
  description: '',
  requirements: {}
};

const LoyaltyForm = ({ loyalty, onSave }: LoyaltyFormProps) => {
  const [formData, setFormData] = useState<Loyalty>(loyalty || defaultLoyalty);
  const [errors, setErrors] = useState<Partial<Record<keyof Loyalty, string>>>({});
  const [requirementsText, setRequirementsText] = useState('');

  useEffect(() => {
    if (loyalty) {
      setFormData(loyalty);
      setRequirementsText(loyalty.requirements ? JSON.stringify(loyalty.requirements, null, 2) : '');
    } else {
      setFormData(defaultLoyalty);
      setRequirementsText('');
    }
  }, [loyalty]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Loyalty, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название уровня обязательно';
    }
    
    if (formData.discount < 0 || formData.discount > 100) {
      newErrors.discount = 'Скидка должна быть от 0 до 100';
    }

    // Validate requirements JSON
    if (requirementsText) {
      try {
        JSON.parse(requirementsText);
      } catch {
        newErrors.requirements = 'Требования должны быть в формате JSON';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequirementsText(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      const loyaltyToSave = {
        ...formData,
        requirements: requirementsText ? JSON.parse(requirementsText) : undefined
      };
      onSave(loyaltyToSave);
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
        <label className="block text-gray-700 mb-1">Скидка (%)</label>
        <input
          type="number"
          name="discount"
          value={formData.discount}
          onChange={handleChange}
          min="0"
          max="100"
          className={`w-full px-3 py-2 border rounded ${errors.discount ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Описание</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Требования (JSON)</label>
        <textarea
          name="requirementsText"
          value={requirementsText}
          onChange={handleRequirementsChange}
          rows={5}
          placeholder="{ }"
          className={`w-full px-3 py-2 border rounded font-mono ${errors.requirements ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.requirements && <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>}
        <p className="text-xs text-gray-500 mt-1">Введите требования в формате JSON</p>
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

export default LoyaltyForm; 