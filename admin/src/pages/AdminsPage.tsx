import { useState, useEffect } from 'react';
import AdminList from '../components/AdminList';
import AdminForm from '../components/AdminForm';
import PasswordChangeForm from '../components/PasswordChangeForm';
import UserAssociationModal from '../components/UserAssociationModal';
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
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'password'>('add');
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

  const handleEditUserAssociation = (adminId: string) => {
    setSelectedAdminId(adminId);
    setShowUserModal(true);
  };

  const handleSaveUserAssociation = async (adminId: string, userId: string) => {
    try {
      setLoading(true);
      await adminService.updateUserAssociation(adminId, userId);
      await fetchAdmins();
      setShowUserModal(false);
      setSelectedAdminId(null);
      setSuccessMessage('Пользователь успешно привязан к администратору');
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.detail || 'Ошибка при привязке пользователя');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUserAssociation = () => {
    setShowUserModal(false);
    setSelectedAdminId(null);
  };

  const getSelectedAdminUserId = () => {
    if (!selectedAdminId) return undefined;
    const admin = admins.find(a => a.id === selectedAdminId);
    return admin?.user_id;
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
        {/* Left column - Admin list */}
        <div className="w-full lg:w-7/12 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Список администраторов</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <p className="text-center py-4">Загрузка...</p>
            ) : admins.length > 0 ? (
              <AdminList 
                admins={admins} 
                onDelete={handleDeleteAdmin} 
                onEditUserAssociation={handleEditUserAssociation}
              />
            ) : (
              <p className="text-center py-4 text-gray-500">Нет доступных администраторов</p>
            )}
          </div>
        </div>

        {/* Right column - Forms section */}
        <div className="w-full lg:w-5/12 bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'add'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('add')}
              >
                Добавить администратора
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'password'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('password')}
              >
                Изменить пароль
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'add' ? (
              currentAdmin?.is_superuser ? (
                <AdminForm onSubmit={handleAddAdmin} />
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500">Только суперпользователи могут добавлять новых администраторов.</p>
                </div>
              )
            ) : (
              <PasswordChangeForm onSubmit={handleChangePassword} />
            )}
          </div>
        </div>
      </div>

      {/* User association modal */}
      {showUserModal && selectedAdminId && (
        <UserAssociationModal
          adminId={selectedAdminId}
          currentUserId={getSelectedAdminUserId()}
          onCancel={handleCancelUserAssociation}
          onSave={handleSaveUserAssociation}
        />
      )}
    </div>
  );
};

export default AdminsPage; 