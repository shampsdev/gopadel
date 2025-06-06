import { useState, useEffect } from 'react';
import type { Registration } from '../services/registration';
import { registrationService } from '../services/registration';
import { userService } from '../services/user';
import { tournamentService } from '../services/tournament';
import type { UserListItem, Tournament } from '../shared/types';
import RegistrationList from '../components/RegistrationList';
import RegistrationDetail from '../components/RegistrationDetail';

const RegistrationsPage = () => {
  // Registration states
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [registrationsPerPage] = useState(5);

  // Filter states
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [userFilter, setUserFilter] = useState<string>('');
  const [tournamentFilter, setTournamentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dropdown data
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(false);

  // Mobile state for showing detail view
  const [showDetail, setShowDetail] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(totalRegistrations / registrationsPerPage);

  const fetchRegistrations = async (page: number = 1) => {
    try {
      setLoading(true);
      const skip = (page - 1) * registrationsPerPage;
      const filters: { user_id?: string; tournament_id?: string; status?: string } = {};
      if (userFilter) filters.user_id = userFilter;
      if (tournamentFilter) filters.tournament_id = tournamentFilter;
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
      const { registrations: fetchedRegistrations, total } = await registrationService.getAll(skip, registrationsPerPage, filters);
      setRegistrations(fetchedRegistrations);
      setTotalRegistrations(total);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке регистраций');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await userService.getAllUsers();
      setUsers(users);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoadingTournaments(true);
      const fetchedTournaments = await tournamentService.getAll();
      setTournaments(fetchedTournaments);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
    } finally {
      setLoadingTournaments(false);
    }
  };

  useEffect(() => {
    // Load all required data
    const initData = async () => {
      await Promise.all([
        fetchRegistrations(currentPage),
        fetchUsers(),
        fetchTournaments()
      ]);
    };
    
    initData();
  }, []);

  useEffect(() => {
    // Re-fetch registrations when page changes or filters change
    fetchRegistrations(currentPage);
  }, [currentPage, userFilter, tournamentFilter, statusFilter]);

  const handleSelectRegistration = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowDetail(true); // Show detail view on mobile
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusUpdate = async (registrationId: string, newStatus: string) => {
    try {
      await registrationService.updateStatus(registrationId, newStatus);
      // Refresh registrations list
      await fetchRegistrations(currentPage);
      // Update selected registration if it was updated
      if (selectedRegistration?.id === registrationId) {
        const updatedRegistration = registrations.find(r => r.id === registrationId);
        if (updatedRegistration) {
          setSelectedRegistration(updatedRegistration);
        }
      }
    } catch (err) {
      setError('Ошибка при обновлении статуса регистрации');
      console.error(err);
    }
  };

  const clearFilters = () => {
    setUserFilter('');
    setTournamentFilter('');
    setStatusFilter('all');
  };

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedRegistration(null);
  };

  return (
    <div className="p-3 md:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-black">Регистрации</h1>
        
        {/* Mobile back button */}
        {showDetail && selectedRegistration && (
          <button
            onClick={handleBackToList}
            className="lg:hidden flex items-center text-green-700 hover:text-green-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к списку
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left side - Registration list */}
        <div className={`w-full lg:w-1/3 bg-white rounded-lg shadow ${showDetail ? 'hidden lg:block' : 'block'}`}>
          <div className="p-3 md:p-4 border-b">
            <h2 className="text-base md:text-lg font-medium">Список регистраций</h2>
          </div>
          
          {/* Filters section */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center text-sm text-green-700 hover:text-green-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {isFilterExpanded ? 'Скрыть фильтры' : 'Показать фильтры'}
              </button>
              {isFilterExpanded && (
                <button 
                  onClick={clearFilters} 
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Сбросить
                </button>
              )}
            </div>
            
            <div className={`space-y-3 ${isFilterExpanded ? 'block' : 'hidden'}`}>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Пользователь</label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  disabled={loadingUsers}
                >
                  <option value="">Все пользователи</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.second_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Турнир</label>
                <select
                  value={tournamentFilter}
                  onChange={(e) => setTournamentFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  disabled={loadingTournaments}
                >
                  <option value="">Все турниры</option>
                  {tournaments.map(tournament => (
                    <option key={tournament.id?.toString()} value={tournament.id?.toString()}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Статус регистрации</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Все статусы</option>
                  <option value="pending">В ожидании</option>
                  <option value="active">Активна</option>
                  <option value="canceled">Отменена</option>
                  <option value="canceled_by_user">Отменена пользователем</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-sm text-gray-500">Загрузка...</p>
              </div>
            ) : registrations.length > 0 ? (
              <RegistrationList
                registrations={registrations}
                onSelect={handleSelectRegistration}
                selectedId={selectedRegistration?.id}
                currentPage={currentPage}
                totalPages={totalPages}
                onChangePage={handleChangePage}
              />
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">Регистрации не найдены</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Registration details */}
        <div className={`w-full lg:w-2/3 ${showDetail ? 'block' : 'hidden lg:block'}`}>
          {selectedRegistration ? (
            <RegistrationDetail 
              registration={selectedRegistration} 
              onStatusUpdate={handleStatusUpdate}
            />
          ) : (
            <div className="bg-white p-6 md:p-8 lg:p-12 rounded-lg shadow text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Выберите регистрацию</h3>
              <p className="text-gray-500 text-sm">Нажмите на регистрацию в списке слева, чтобы просмотреть детали</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationsPage; 