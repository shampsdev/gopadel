import { useState, useEffect } from 'react';
import AdminList from '../components/AdminList';
import AdminForm from '../components/AdminForm';
import PasswordChangeForm from '../components/PasswordChangeForm';
import { adminService } from '../services/admin';
import type { AdminUser, CreateAdminRequest, PasswordChangeRequest } from '../services/admin';
import { useUser } from '../context/UserContext';
import { AxiosError } from 'axios';

interface ErrorResponse {
  detail: string;
}

const AdminsPage = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { currentAdmin } = useUser();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAll();
      setAdmins(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке администраторов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (adminData: CreateAdminRequest) => {
    try {
      setLoading(true);
      await adminService.create(adminData);
      await fetchAdmins();
      setSuccessMessage('Администратор успешно добавлен');
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.detail || 'Ошибка при создании администратора');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!window.confirm('Вы действительно хотите удалить этого администратора?')) {
      return;
    }

    try {
      setLoading(true);
      await adminService.delete(adminId);
      await fetchAdmins();
      setSuccessMessage('Администратор успешно удален');
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.detail || 'Ошибка при удалении администратора');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (passwordData: PasswordChangeRequest) => {
    try {
      setLoading(true);
      await adminService.changePassword(passwordData);
      setSuccessMessage('Пароль успешно изменен');
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.detail || 'Ошибка при изменении пароля');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-black mb-6">Администраторы</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Admin list */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Список администраторов</h2>
            </div>
            <div className="p-4">
              {loading ? (
                <p className="text-center py-4">Загрузка...</p>
              ) : admins.length > 0 ? (
                <AdminList admins={admins} onDelete={handleDeleteAdmin} />
              ) : (
                <p className="text-center py-4 text-gray-500">Нет доступных администраторов</p>
              )}
            </div>
          </div>

          {/* Password change form */}
          <PasswordChangeForm onSubmit={handleChangePassword} />
        </div>

        {/* Right side - Admin form (only for superusers) */}
        <div className="w-full lg:w-1/2">
          {currentAdmin?.is_superuser ? (
            <AdminForm onSubmit={handleAddAdmin} />
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Только суперпользователи могут добавлять новых администраторов.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminsPage; 