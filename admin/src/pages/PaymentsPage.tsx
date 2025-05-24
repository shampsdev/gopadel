import { useState, useEffect } from 'react';
import type { Payment } from '../services/payment';
import { paymentService } from '../services/payment';
import { userService } from '../services/user';
import { tournamentService } from '../services/tournament';
import type { User, Tournament } from '../shared/types';
import PaymentList from '../components/PaymentList';
import PaymentDetail from '../components/PaymentDetail';

const PaymentsPage = () => {
  // Payment states
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [paymentsPerPage] = useState(5);

  // Filter states
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [userFilter, setUserFilter] = useState<string>('');
  const [tournamentFilter, setTournamentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dropdown data
  const [users, setUsers] = useState<User[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(totalPayments / paymentsPerPage);

  const fetchPayments = async (page: number = 1) => {
    try {
      setLoading(true);
      const skip = (page - 1) * paymentsPerPage;
      const filters: { user_id?: string; tournament_id?: string; status?: string } = {};
      if (userFilter) filters.user_id = userFilter;
      if (tournamentFilter) filters.tournament_id = tournamentFilter;
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
      const { payments: fetchedPayments, total } = await paymentService.getAll(skip, paymentsPerPage, filters);
      setPayments(fetchedPayments);
      setTotalPayments(total);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке платежей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { users: fetchedUsers } = await userService.getAll(0, 1000); // Get all users
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoadingTournaments(true);
      const fetchedTournaments = await tournamentService.getAll(); // Get all tournaments
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
        fetchPayments(currentPage),
        fetchUsers(),
        fetchTournaments()
      ]);
    };
    
    initData();
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    // Re-fetch payments when page changes or filters change
    fetchPayments(currentPage);
  }, [currentPage, userFilter, tournamentFilter, statusFilter]);

  const handleSelectPayment = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setUserFilter('');
    setTournamentFilter('');
    setStatusFilter('all');
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-black mb-6">Платежи</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Payment list */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Список платежей</h2>
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
                <label className="block text-xs text-gray-600 mb-1">Пользователь</label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
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
                <label className="block text-xs text-gray-600 mb-1">Турнир</label>
                <select
                  value={tournamentFilter}
                  onChange={(e) => setTournamentFilter(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
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
                <label className="block text-xs text-gray-600 mb-1">Статус оплаты</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="all">Все статусы</option>
                  <option value="succeeded">Оплачен</option>
                  <option value="pending">В ожидании</option>
                  <option value="waiting_for_capture">Ожидает списания</option>
                  <option value="canceled">Отменен</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            {loading ? (
              <p className="text-center py-4">Загрузка...</p>
            ) : payments.length > 0 ? (
              <PaymentList
                payments={payments}
                onSelect={handleSelectPayment}
                selectedId={selectedPayment?.id}
                currentPage={currentPage}
                totalPages={totalPages}
                onChangePage={handleChangePage}
              />
            ) : (
              <p className="text-center py-4 text-gray-500">Платежи не найдены</p>
            )}
          </div>
        </div>
        
        {/* Right side - Payment details */}
        <div className="w-full lg:w-2/3">
          {selectedPayment ? (
            <PaymentDetail payment={selectedPayment} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              Выберите платеж для просмотра деталей
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage; 