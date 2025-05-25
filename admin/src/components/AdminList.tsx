import type { AdminUser } from "../services/admin";
import { useUser } from "../context/UserContext";

interface AdminListProps {
  admins: AdminUser[];
  onDelete: (adminId: string) => void;
  onEditUserAssociation: (adminId: string) => void;
}

const AdminList = ({ admins, onDelete, onEditUserAssociation }: AdminListProps) => {
  const { currentAdmin } = useUser();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Имя пользователя
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Имя
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Фамилия
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Связанный пользователь
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Роль
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            {currentAdmin?.is_superuser && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {admin.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {admin.first_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {admin.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {admin.user_id ? (
                  <span className="text-blue-600">{admin.user_id.substring(0, 8)}...</span>
                ) : (
                  <span className="text-gray-400">Не привязан</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  admin.is_superuser ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {admin.is_superuser ? 'Суперпользователь' : 'Администратор'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  admin.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {admin.is_active ? 'Активен' : 'Не активен'}
                </span>
              </td>
              {currentAdmin?.is_superuser && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {/* Edit user association button */}
                  <button
                    onClick={() => onEditUserAssociation(admin.id)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    {admin.user_id ? 'Изменить' : 'Привязать'} пользователя
                  </button>
                
                  {/* Don't allow deleting current admin or if current admin is not superuser */}
                  {currentAdmin?.username !== admin.username && (
                    <button
                      onClick={() => onDelete(admin.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminList; 