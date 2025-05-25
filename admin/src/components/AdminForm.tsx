import { useState } from "react";
import type { CreateAdminRequest } from "../services/admin";
import { useUser } from "../context/UserContext";
import UserAssociationModal from "./UserAssociationModal";

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
    user_id: undefined,
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAdminRequest, string>>>({});
  const [showUserModal, setShowUserModal] = useState(false);

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
        user_id: undefined,
      });
    }
  };

  const handleOpenUserModal = () => {
    setShowUserModal(true);
  };

  const handleSaveUserAssociation = (_adminId: string, userId: string) => {
    setFormData({
      ...formData,
      user_id: userId,
    });
    setShowUserModal(false);
  };

  const handleCancelUserAssociation = () => {
    setShowUserModal(false);
  };

  const handleRemoveUserAssociation = () => {
    setFormData({
      ...formData,
      user_id: undefined,
    });
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
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пользователь
            </label>
            <div className="flex items-center space-x-2">
              {formData.user_id ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm flex-grow">
                    ID пользователя: {formData.user_id.substring(0, 8)}...
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveUserAssociation}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Удалить
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenUserModal}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Выбрать пользователя
                </button>
              )}
            </div>
          </div>
        
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
        </>
      )}
      
      <div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Добавить администратора
        </button>
      </div>

      {showUserModal && (
        <UserAssociationModal
          adminId=""
          currentUserId={formData.user_id}
          onCancel={handleCancelUserAssociation}
          onSave={handleSaveUserAssociation}
        />
      )}
    </form>
  );
};

export default AdminForm; 