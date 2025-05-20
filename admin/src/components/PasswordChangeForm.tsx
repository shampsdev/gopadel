import { useState } from "react";
import type { PasswordChangeRequest } from "../services/admin";

interface PasswordChangeFormProps {
  onSubmit: (data: PasswordChangeRequest) => void;
}

const PasswordChangeForm = ({ onSubmit }: PasswordChangeFormProps) => {
  const [formData, setFormData] = useState<PasswordChangeRequest>({
    old_password: '',
    new_password: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordChangeRequest | 'confirm_password', string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PasswordChangeRequest | 'confirm_password', string>> = {};
    
    if (!formData.old_password) {
      newErrors.old_password = 'Текущий пароль обязателен';
    }
    
    if (!formData.new_password) {
      newErrors.new_password = 'Новый пароль обязателен';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'Пароль должен содержать минимум 6 символов';
    }
    
    if (formData.new_password !== confirmPassword) {
      newErrors.confirm_password = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirm_password') {
      setConfirmPassword(value);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
      // Reset form after submission
      setFormData({
        old_password: '',
        new_password: '',
      });
      setConfirmPassword('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Изменить пароль</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Текущий пароль *
        </label>
        <input
          type="password"
          name="old_password"
          value={formData.old_password}
          onChange={handleChange}
          className={`block w-full rounded-md border ${
            errors.old_password ? 'border-red-300' : 'border-gray-300'
          } shadow-sm px-3 py-2 focus:border-green-500 focus:ring-green-500`}
        />
        {errors.old_password && (
          <p className="mt-1 text-sm text-red-600">{errors.old_password}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Новый пароль *
        </label>
        <input
          type="password"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          className={`block w-full rounded-md border ${
            errors.new_password ? 'border-red-300' : 'border-gray-300'
          } shadow-sm px-3 py-2 focus:border-green-500 focus:ring-green-500`}
        />
        {errors.new_password && (
          <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Подтвердите новый пароль *
        </label>
        <input
          type="password"
          name="confirm_password"
          value={confirmPassword}
          onChange={handleChange}
          className={`block w-full rounded-md border ${
            errors.confirm_password ? 'border-red-300' : 'border-gray-300'
          } shadow-sm px-3 py-2 focus:border-green-500 focus:ring-green-500`}
        />
        {errors.confirm_password && (
          <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
        )}
      </div>
      
      <div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Изменить пароль
        </button>
      </div>
    </form>
  );
};

export default PasswordChangeForm; 