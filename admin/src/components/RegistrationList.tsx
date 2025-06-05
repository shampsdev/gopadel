import type { Registration } from '../services/registration';

interface RegistrationListProps {
  registrations: Registration[];
  onSelect: (registration: Registration) => void;
  selectedId?: string;
  currentPage: number;
  totalPages: number;
  onChangePage: (page: number) => void;
}

const RegistrationList = ({
  registrations,
  onSelect,
  selectedId,
  currentPage,
  totalPages,
  onChangePage
}: RegistrationListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'canceled_by_user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'pending':
        return 'В ожидании';
      case 'canceled':
        return 'Отменена';
      case 'canceled_by_user':
        return 'Отменена пользователем';
      default:
        return status;
    }
  };

  const getPaymentStatus = (registration: Registration) => {
    if (!registration.payments || registration.payments.length === 0) {
      return 'Нет платежей';
    }
    
    const activePayments = registration.payments.filter(p => p.status !== 'canceled');
    if (activePayments.length === 0) {
      return 'Все платежи отменены';
    }
    
    const succeededPayments = activePayments.filter(p => p.status === 'succeeded');
    if (succeededPayments.length > 0) {
      return 'Оплачено';
    }
    
    const pendingPayments = activePayments.filter(p => p.status === 'pending' || p.status === 'waiting_for_capture');
    if (pendingPayments.length > 0) {
      return 'Ожидает оплаты';
    }
    
    return 'Неизвестно';
  };

  const getPaymentStatusClass = (registration: Registration) => {
    if (!registration.payments || registration.payments.length === 0) {
      return 'text-gray-500';
    }
    
    const activePayments = registration.payments.filter(p => p.status !== 'canceled');
    if (activePayments.length === 0) {
      return 'text-red-500';
    }
    
    const succeededPayments = activePayments.filter(p => p.status === 'succeeded');
    if (succeededPayments.length > 0) {
      return 'text-green-600';
    }
    
    const pendingPayments = activePayments.filter(p => p.status === 'pending' || p.status === 'waiting_for_capture');
    if (pendingPayments.length > 0) {
      return 'text-yellow-600';
    }
    
    return 'text-gray-500';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto" style={{ maxHeight: '60vh' }}>
        {registrations.length === 0 ? (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">Регистрации не найдены</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedId === registration.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
                onClick={() => onSelect(registration)}
              >
                {/* Mobile layout */}
                <div className="block md:hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm">
                      {registration.user ? 
                        `${registration.user.first_name} ${registration.user.second_name}` : 
                        'Пользователь не указан'}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(registration.status)}`}>
                      {getStatusText(registration.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {registration.tournament ? registration.tournament.name : 'Турнир не указан'}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-500">
                      {formatDate(registration.date)}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        Платежей: {registration.payments?.length || 0}
                      </div>
                      <div className={`text-xs font-medium ${getPaymentStatusClass(registration)}`}>
                        {getPaymentStatus(registration)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:block">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">
                      {registration.user ? 
                        `${registration.user.first_name} ${registration.user.second_name}` : 
                        'Пользователь не указан'}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(registration.status)}`}>
                      {getStatusText(registration.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {registration.tournament ? registration.tournament.name : 'Турнир не указан'}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <div>{formatDate(registration.date)}</div>
                    <div className="text-right">
                      <div>Платежей: {registration.payments?.length || 0}</div>
                      <div className={`font-medium ${getPaymentStatusClass(registration)}`}>
                        {getPaymentStatus(registration)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      <div className="px-3 py-3 border-t flex justify-between items-center bg-white">
        <button
          onClick={() => onChangePage(currentPage - 1)}
          disabled={currentPage === 1 || totalPages < 2}
          className={`px-3 py-2 text-sm rounded transition-colors ${
            currentPage === 1 || totalPages < 2
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-green-700 hover:bg-green-50 bg-white border border-green-200'
          }`}
        >
          <span className="hidden sm:inline">&larr; Назад</span>
          <span className="sm:hidden">&larr;</span>
        </button>
        
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <span className="text-xs text-gray-500 text-center">
            Страница {totalPages === 0 ? 1 : currentPage} из {totalPages === 0 ? 1 : totalPages}
          </span>
          <span className="text-xs text-gray-400 hidden sm:inline">•</span>
          <span className="text-xs text-gray-500 text-center">
            Всего: {registrations.length}
          </span>
        </div>
        
        <button
          onClick={() => onChangePage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages < 2}
          className={`px-3 py-2 text-sm rounded transition-colors ${
            currentPage === totalPages || totalPages < 2
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-green-700 hover:bg-green-50 bg-white border border-green-200'
          }`}
        >
          <span className="hidden sm:inline">Вперед &rarr;</span>
          <span className="sm:hidden">&rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default RegistrationList; 