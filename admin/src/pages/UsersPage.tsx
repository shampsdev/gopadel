import { useState, useEffect } from 'react';
import type { User, Loyalty } from '../shared/types';
import { userService } from '../services/user';
import { loyaltyService } from '../services/loyalty';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';

const UsersPage = () => {
  // User states
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Loyalty states
  const [loyalties, setLoyalties] = useState<Loyalty[]>([]);
  const [loadingLoyalty, setLoadingLoyalty] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);
  
  // Search and filter states
  const [nameFilter, setNameFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [isRegisteredFilter, setIsRegisteredFilter] = useState<string>('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const fetchLoyalties = async () => {
    try {
      setLoadingLoyalty(true);
      const data = await loyaltyService.getAll();
      setLoyalties(data);
    } catch (err) {
      console.error('Error fetching loyalty levels:', err);
    } finally {
      setLoadingLoyalty(false);
    }
  };

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const skip = (page - 1) * usersPerPage;
      const { users: fetchedUsers, total } = await userService.getAll(skip, usersPerPage);
      
      // Attach loyalty objects to users
      const usersWithLoyalty = fetchedUsers.map(user => {
        const loyaltyObj = loyalties.find(l => l.id === user.loyalty_id);
        return {
          ...user,
          loyalty: loyaltyObj
        };
      });
      
      setUsers(usersWithLoyalty);
      setTotalUsers(total);
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
      await fetchLoyalties();
      await fetchUsers(currentPage);
    };
    
    initData();
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    // Re-fetch users when page changes
    if (!loadingLoyalty && loyalties.length > 0) {
      fetchUsers(currentPage);
    }
  }, [currentPage, loadingLoyalty]);

  const handleSelectUser = (user: User) => {
    // Make sure selected user has the loyalty object
    const loyaltyObj = loyalties.find(l => l.id === user.loyalty_id);
    setSelectedUser({
      ...user,
      loyalty: loyaltyObj
    });
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const handleSave = async (updatedUserData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const updatedUser = await userService.update({
        id: selectedUser.id,
        ...updatedUserData
      });
      
      // Refresh the users list
      await fetchUsers(currentPage);
      
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
      setLoading(false);
    }
  };

  // Local client-side filtering
  // Note: In a production app with many users, these filters should be moved to the server-side API
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.second_name}`.toLowerCase();
    
    // Filter by name
    if (nameFilter && !fullName.includes(nameFilter.toLowerCase())) {
      return false;
    }
    
    // Filter by city
    if (cityFilter && !user.city.toLowerCase().includes(cityFilter.toLowerCase())) {
      return false;
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

  const clearFilters = () => {
    setNameFilter('');
    setCityFilter('');
    setIsRegisteredFilter('all');
  };

  const isLoading = loading || (loadingLoyalty && loyalties.length === 0);

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
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Список пользователей</h2>
          </div>
          
          {/* Filters section */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center text-sm text-green-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {isFilterExpanded ? 'Скрыть фильтры' : 'Показать фильтры'}
              </button>
              {isFilterExpanded && (
                <button 
                  onClick={clearFilters} 
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Сбросить
                </button>
              )}
            </div>
            
            <div className={`space-y-2 ${isFilterExpanded ? 'block' : 'hidden'}`}>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Поиск по имени</label>
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Введите имя или фамилию"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Город</label>
                <input
                  type="text"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  placeholder="Введите город"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Статус регистрации</label>
                <select
                  value={isRegisteredFilter}
                  onChange={(e) => setIsRegisteredFilter(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="all">Все</option>
                  <option value="registered">Зарегистрированные</option>
                  <option value="unregistered">Не зарегистрированные</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            {isLoading ? (
              <p className="text-center py-4">Загрузка...</p>
            ) : filteredUsers.length > 0 ? (
              <UserList
                users={filteredUsers}
                onSelect={handleSelectUser}
                selectedId={selectedUser?.id}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handleChangePage}
              />
            ) : (
              <p className="text-center py-4 text-gray-500">
                {nameFilter || cityFilter || isRegisteredFilter !== 'all' 
                  ? 'Нет пользователей, соответствующих фильтрам' 
                  : 'Нет доступных пользователей'}
              </p>
            )}
          </div>
        </div>
        
        {/* Right side - User form */}
        <div className="w-full lg:w-2/3 bg-white rounded-lg shadow p-6 mt-4 lg:mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Загрузка...</p>
            </div>
          ) : selectedUser && loyalties.length > 0 ? (
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
                    <p className="text-xs text-gray-500">ID: {selectedUser.telegram_id}</p>
                  </div>
                </div>
              </div>
              <UserForm user={selectedUser} loyalties={loyalties} onSave={handleSave} />
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