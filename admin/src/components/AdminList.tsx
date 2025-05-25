import type { AdminUser } from "../services/admin";
import { useUser } from "../context/UserContext";
import { useState, useEffect } from "react";
import { userService } from "../services/user";
import { useNavigate } from "react-router-dom";
import type { User } from "../shared/types";

interface AdminListProps {
  admins: AdminUser[];
  onDelete: (adminId: string) => void;
  onEditUserAssociation: (adminId: string) => void;
}

const AdminList = ({ admins, onDelete, onEditUserAssociation }: AdminListProps) => {
  const { currentAdmin } = useUser();
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch users data for linked admin users
  useEffect(() => {
    const fetchLinkedUsers = async () => {
      const userIds = admins
        .filter(admin => admin.user_id)
        .map(admin => admin.user_id as string);
      
      if (userIds.length === 0) return;
      
      setLoading(true);
      try {
        const userMap: Record<string, User> = {};
        
        // Fetch each user individually
        for (const userId of userIds) {
          try {
            const user = await userService.getById(userId);
            userMap[userId] = user;
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
        
        setUsersMap(userMap);
      } catch (error) {
        console.error("Error fetching linked users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLinkedUsers();
  }, [admins]);

  const handleOpenUserDetails = (userId: string) => {
    navigate(`/users?userId=${userId}`);
  };

  // For mobile display - simplified table content
  const renderMobileCard = (admin: AdminUser) => {
    const linkedUser = admin.user_id ? usersMap[admin.user_id] : null;
    
    return (
      <div key={admin.id} className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
        <div className="flex justify-between items-start mb-2">
          <div className="font-medium">{admin.username}</div>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              admin.is_superuser ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {admin.is_superuser ? 'Суперпользователь' : 'Администратор'}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <div className="mb-1">{admin.first_name} {admin.last_name}</div>
          
          <div className="mb-2">
            {loading && admin.user_id ? (
              <span className="text-gray-400">Загрузка...</span>
            ) : admin.user_id && linkedUser ? (
              <div className="flex items-center">
                <span className="mr-2">Пользователь:</span>
                <button 
                  onClick={() => handleOpenUserDetails(admin.user_id as string)}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {linkedUser.username ? `@${linkedUser.username}` : `${linkedUser.first_name} ${linkedUser.second_name}`}
                </button>
              </div>
            ) : (
              <span className="text-gray-400">Пользователь не привязан</span>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              admin.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {admin.is_active ? 'Активен' : 'Не активен'}
            </span>
            
            {currentAdmin?.is_superuser && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditUserAssociation(admin.id)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  {admin.user_id ? 'Изменить' : 'Привязать'}
                </button>
                
                {currentAdmin?.username !== admin.username && (
                  <button
                    onClick={() => onDelete(admin.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Удалить
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Desktop table - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Имя пользователя
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Имя/Фамилия
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Связанный пользователь
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              {currentAdmin?.is_superuser && (
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => {
              const linkedUser = admin.user_id ? usersMap[admin.user_id] : null;
              
              return (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                      {admin.is_superuser && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          СУ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {admin.first_name} {admin.last_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {loading && admin.user_id ? (
                      <span className="text-gray-400">Загрузка...</span>
                    ) : admin.user_id && linkedUser ? (
                      <button 
                        onClick={() => handleOpenUserDetails(admin.user_id as string)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {linkedUser.username ? `@${linkedUser.username}` : `${linkedUser.first_name} ${linkedUser.second_name}`}
                      </button>
                    ) : (
                      <span className="text-gray-400">Не привязан</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.is_active ? 'Активен' : 'Не активен'}
                    </span>
                  </td>
                  {currentAdmin?.is_superuser && (
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEditUserAssociation(admin.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {admin.user_id ? 'Изменить' : 'Привязать'}
                      </button>
                    
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards - shown only on mobile */}
      <div className="md:hidden">
        {admins.map(admin => renderMobileCard(admin))}
      </div>
    </div>
  );
};

export default AdminList; 