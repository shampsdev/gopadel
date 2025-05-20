import { useState } from "react";
import type { CreateAdminRequest } from "../services/admin";
import { useUser } from "../context/UserContext";

interface AdminFormProps {
  onSubmit: (data: CreateAdminRequest) => void;
}

const AdminForm = ({ onSubmit }: AdminFormProps) => {
  const { currentAdmin } = useUser();
  const [formData, setFormData] = useState<CreateAdminRequest>({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    is_superuser: false,
    is_active: true,
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAdminRequest, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateAdminRequest, string>> = {};
    
    if (!formData.username) {
      newErrors.username = 'Имя пользователя обязательно';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    if (!formData.first_name) {
      newErrors.first_name = 'Имя обязательно';
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Фамилия обязательна';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        is_superuser: false,
        is_active: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить нового администратора</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Имя пользователя *
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`block w-full rounded-md border ${
              errors.username ? 'border-red-300' : 'border-gray-300'
            } shadow-sm px-3 py-2 focus:border-green-500 focus:ring-green-500`}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Пароль *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`block w-full rounded-md border ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            } shadow-sm px-3 py-2 focus:border-green-500 focus:ring-green-500`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Имя *
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={`block w-full rounded-md border ${
              errors.first_name ? 'border-red-300' : 'border-gray-300'
            } shadow-sm px-3 py-2 focus:border-green-500 focus:ring-green-500`}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Фамилия *
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={`block w-full rounded-md border ${
              errors.last_name ? 'border-red-300' : 'border-gray-300'
            } shadow-sm px-3 py-2 focus:border-green-500 focus:ring-green-500`}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
          )}
        </div>
      </div>
      
      {currentAdmin?.is_superuser && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              id="is_superuser"
              name="is_superuser"
              type="checkbox"
              checked={formData.is_superuser}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="is_superuser" className="ml-2 text-sm text-gray-700">
              Суперпользователь
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Активный
            </label>
          </div>
        </div>
      )}
      
      <div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Добавить администратора
        </button>
      </div>
    </form>
  );
};

export default AdminForm; 