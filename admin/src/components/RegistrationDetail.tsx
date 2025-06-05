import { useState } from 'react';
import type { Registration } from '../services/registration';

interface RegistrationDetailProps {
  registration: Registration;
  onStatusUpdate: (registrationId: string, newStatus: string) => Promise<void>;
}

const RegistrationDetail = ({ registration, onStatusUpdate }: RegistrationDetailProps) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(registration.status);

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

  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting_for_capture':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Оплачен';
      case 'pending':
        return 'В ожидании';
      case 'waiting_for_capture':
        return 'Ожидает списания';
      case 'canceled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === registration.status) return;
    
    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(registration.id, selectedStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      // Reset to original status if update failed
      setSelectedStatus(registration.status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Registration Status */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base md:text-lg font-medium mb-3">Статус регистрации</h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium self-start ${getStatusClass(registration.status)}`}>
              {getStatusText(registration.status)}
            </span>
            <span className="text-gray-500 text-sm">
              от {formatDate(registration.date)}
            </span>
          </div>
          
          {/* Status Update Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded"
              disabled={isUpdatingStatus}
            >
              <option value="pending">В ожидании</option>
              <option value="active">Активна</option>
              <option value="canceled">Отменена</option>
              <option value="canceled_by_user">Отменена пользователем</option>
            </select>
            
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdatingStatus || selectedStatus === registration.status}
              className={`px-4 py-2 text-sm rounded font-medium transition-colors ${
                isUpdatingStatus || selectedStatus === registration.status
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isUpdatingStatus ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>

      {/* Registration Details */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base md:text-lg font-medium mb-3">Детали регистрации</h3>
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="text-gray-600 text-sm">ID Регистрации:</span>
            <span className="font-medium text-sm break-all">{registration.id}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="text-gray-600 text-sm">Дата регистрации:</span>
            <span className="font-medium text-sm">{formatDate(registration.date)}</span>
          </div>
        </div>
      </div>

      {/* User Details */}
      {registration.user && (
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base md:text-lg font-medium mb-3">Пользователь</h3>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="text-gray-600 text-sm">Имя:</span>
              <span className="font-medium text-sm">
                {registration.user.first_name} {registration.user.second_name}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="text-gray-600 text-sm">Город:</span>
              <span className="font-medium text-sm">{registration.user.city}</span>
            </div>
            {registration.user.username && (
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 text-sm">Username:</span>
                <span className="font-medium text-sm">@{registration.user.username}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tournament Details */}
      {registration.tournament && (
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base md:text-lg font-medium mb-3">Турнир</h3>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="text-gray-600 text-sm">Название:</span>
              <span className="font-medium text-sm">{registration.tournament.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payments */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base md:text-lg font-medium mb-3">
          Платежи ({registration.payments?.length || 0})
        </h3>
        
        {!registration.payments || registration.payments.length === 0 ? (
          <p className="text-gray-500 text-sm">Платежи отсутствуют</p>
        ) : (
          <div className="space-y-3">
            {registration.payments
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((payment, index) => (
                <div 
                  key={payment.id} 
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <div className="text-sm font-medium">
                      Платеж #{registration.payments!.length - index}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${getPaymentStatusClass(payment.status)}`}>
                      {getPaymentStatusText(payment.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">ID:</span> <span className="break-all">{payment.payment_id}</span>
                      </div>
                      <div>
                        <span className="font-medium">Сумма:</span> {payment.amount} руб.
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-medium">Дата:</span> {formatDate(payment.date)}
                      </div>
                    </div>
                    
                    {payment.payment_link && (
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          onClick={() => window.open(payment.payment_link, '_blank', 'noopener,noreferrer')}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                            />
                          </svg>
                          Открыть ссылку на платеж
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationDetail; 