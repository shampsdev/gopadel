import type { Payment } from '../services/payment';

interface PaymentListProps {
  payments: Payment[];
  onSelect: (payment: Payment) => void;
  selectedId?: string;
  currentPage: number;
  totalPages: number;
  onChangePage: (page: number) => void;
}

const PaymentList = ({
  payments,
  onSelect,
  selectedId,
  currentPage,
  totalPages,
  onChangePage
}: PaymentListProps) => {
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

  const getStatusText = (status: string) => {
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto h-96">
        {payments.length === 0 ? (
          <p className="text-center py-4 text-gray-500">Платежи не найдены</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedId === payment.id ? 'bg-green-50' : ''
                }`}
                onClick={() => onSelect(payment)}
              >
                <div className="flex justify-between">
                  <div className="font-medium mb-1">
                    {payment.registration?.user ? 
                      `${payment.registration.user.first_name} ${payment.registration.user.second_name}` : 
                      'Пользователь не указан'}
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {payment.registration?.tournament ? payment.registration.tournament.name : 'Турнир не указан'}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <div>{formatDate(payment.date)}</div>
                  <div>{payment.amount} руб.</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Pagination */}
      <div className="px-3 py-2 border-t flex justify-between items-center min-h-[38px] bg-white">
        <button
          onClick={() => onChangePage(currentPage - 1)}
          disabled={currentPage === 1 || totalPages < 2}
          className={`px-2 py-1 text-xs rounded ${
            currentPage === 1 || totalPages < 2
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-green-700 hover:bg-green-50'
          }`}
        >
          &larr; Назад
        </button>
        <span className="text-xs text-gray-500">
          Страница {totalPages === 0 ? 1 : currentPage} из {totalPages === 0 ? 1 : totalPages}
        </span>
        <button
          onClick={() => onChangePage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages < 2}
          className={`px-2 py-1 text-xs rounded ${
            currentPage === totalPages || totalPages < 2
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-green-700 hover:bg-green-50'
          }`}
        >
          Вперед &rarr;
        </button>
      </div>
    </div>
  );
};

export default PaymentList; 