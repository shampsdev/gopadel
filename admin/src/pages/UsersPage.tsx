import { useState, useEffect } from 'react';
import type { User, UserListItem, Loyalty } from '../shared/types';
import { userService } from '../services/user';
import { loyaltyService } from '../services/loyalty';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import { useLocation } from 'react-router-dom';

const UsersPage = () => {
  // For query parameters handling
  const location = useLocation();
  
  // User states
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Loyalty states
  const [loyalties, setLoyalties] = useState<Loyalty[]>([]);
  const [loadingLoyalty, setLoadingLoyalty] = useState(true);
  
  // Search and filter states
  const [searchFilter, setSearchFilter] = useState('');
  const [isRegisteredFilter, setIsRegisteredFilter] = useState<string>('all');
  
  // Flag to track if we're loading a user from query params
  const [isLoadingFromQueryParams, setIsLoadingFromQueryParams] = useState(false);

  // Parse URL query parameters to get userId
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('userId');
    
    if (userId) {
      setIsLoadingFromQueryParams(true);
      loadUserById(userId);
    }
  }, [location.search]);

  // Load a specific user by ID
  const loadUserById = async (userId: string) => {
    try {
      setLoadingUser(true);
      const user = await userService.getById(userId);
      
      // Make sure loyalties are loaded before setting selected user
      if (loyalties.length === 0) {
        await fetchLoyalties();
      }
      
      // Add loyalty object to the user
      const loyaltyObj = loyalties.find(l => l.id === user.loyalty_id);
      const userWithLoyalty = {
        ...user,
        loyalty: loyaltyObj
      };
      
      setSelectedUser(userWithLoyalty);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке пользователя');
      console.error(err);
    } finally {
      setLoadingUser(false);
      setIsLoadingFromQueryParams(false);
    }
  };

  const fetchLoyalties = async () => {
    try {
      setLoadingLoyalty(true);
      const data = await loyaltyService.getAll();
      setLoyalties(data);
      return data;
    } catch (err) {
      console.error('Error fetching loyalty levels:', err);
      return [];
    } finally {
      setLoadingLoyalty(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.getAllUsers();
      
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // First load loyalties, then load users
    const initData = async () => {
      const loadedLoyalties = await fetchLoyalties();
      
      // If we're not loading a specific user from query params, load the user list
      if (!isLoadingFromQueryParams) {
        await fetchUsers();
      }
      
      // If we have a userId in the URL, load that specific user
      const queryParams = new URLSearchParams(location.search);
      const userId = queryParams.get('userId');
      
      if (userId && loadedLoyalties.length > 0) {
        loadUserById(userId);
      }
    };
    
    initData();
  }, []); // Empty dependency array - only run once

  const handleSelectUser = (user: UserListItem) => {
    // Load full user information when selecting from list
    loadUserById(user.id);
  };

  // Removed pagination functionality

  const handleSave = async (updatedUserData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      setLoadingUser(true);
      const updatedUser = await userService.update({
        id: selectedUser.id,
        ...updatedUserData
      });
      
      // Update the specific user in the list without reloading everything
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === updatedUser.id 
          ? {
              id: user.id,
              telegram_id: user.telegram_id,
              username: updatedUser.username,
              first_name: updatedUser.first_name,
              second_name: updatedUser.second_name,
              avatar: updatedUser.avatar,
              city: updatedUser.city,
              rank: updatedUser.rank,
              is_registered: updatedUser.is_registered
            }
          : user
      ));
      
      // Update the selected user with returned data and loyalty info
      const loyaltyObj = loyalties.find(l => l.id === updatedUser.loyalty_id);
      setSelectedUser({
        ...updatedUser,
        loyalty: loyaltyObj
      });
      
      setError(null);
    } catch (err) {
      setError('Ошибка при сохранении данных пользователя');
      console.error(err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Local client-side filtering
  // Note: In a production app with many users, these filters should be moved to the server-side API
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.second_name}`.toLowerCase();
    const username = user.username ? user.username.toLowerCase() : '';
    
    // Filter by name, surname or username
    if (searchFilter) {
      const searchTerm = searchFilter.toLowerCase();
      if (!fullName.includes(searchTerm) && !username.includes(searchTerm)) {
        return false;
      }
    }
    
    // Filter by registration status
    if (isRegisteredFilter !== 'all') {
      const isRegistered = isRegisteredFilter === 'registered';
      if (user.is_registered !== isRegistered) {
        return false;
      }
    }
    
    return true;
  });





  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-black mb-6">Пользователи</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - User list */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow max-h-[600px] flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Список пользователей</h2>
                <p className="text-xs text-gray-500">
                  Всего: {users.length}
                  {(searchFilter || isRegisteredFilter !== 'all') && 
                    ` | Отфильтровано: ${filteredUsers.length}`}
                </p>
              </div>
            </div>
          </div>
          
          {/* Search section */}
          <div className="p-3 border-b flex-shrink-0">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Поиск по имени, фамилии или никнейму..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {searchFilter && (
                <button
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchFilter('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Статус регистрации</label>
              <select
                value={isRegisteredFilter}
                onChange={(e) => setIsRegisteredFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="all">Все</option>
                <option value="registered">Зарегистрированные</option>
                <option value="unregistered">Не зарегистрированные</option>
              </select>
            </div>
          </div>
          
          <div className="p-2 flex-1 min-h-0">
            {loading && users.length === 0 ? (
              <p className="text-center py-4">Загрузка...</p>
            ) : filteredUsers.length > 0 ? (
              <UserList
                users={filteredUsers}
                onSelect={handleSelectUser}
                selectedId={selectedUser?.id}
                currentPage={1}
                totalPages={1}
                onPageChange={() => {}}
              />
            ) : (
              <p className="text-center py-4 text-gray-500">
                {searchFilter || isRegisteredFilter !== 'all' 
                  ? 'Нет пользователей, соответствующих фильтрам' 
                  : 'Нет доступных пользователей'}
              </p>
            )}
          </div>
        </div>
        
        {/* Right side - User form */}
        <div className="w-full lg:w-2/3 bg-white rounded-lg shadow p-6 mt-4 lg:mt-0 max-h-[600px] overflow-y-auto">
          {loadingUser ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Загрузка пользователя...</p>
            </div>
          ) : selectedUser && loyalties.length > 0 && !loadingLoyalty ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Редактирование пользователя</h2>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                    {selectedUser.avatar && (
                      <img src={selectedUser.avatar} alt={selectedUser.first_name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser.first_name} {selectedUser.second_name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedUser.username ? `@${selectedUser.username}` : `ID: ${selectedUser.telegram_id}`}
                    </p>
                  </div>
                </div>
              </div>
              <UserForm user={selectedUser} loyalties={loyalties} onSave={handleSave} loading={loadingUser} />
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Выберите пользователя из списка для редактирования
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage; 