import type { Payment } from '../services/payment';

interface PaymentDetailProps {
  payment: Payment;
}

const PaymentDetail = ({ payment }: PaymentDetailProps) => {
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
    <div className="space-y-6">
      {/* Payment Status */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-3">Статус платежа</h3>
        <div className="flex items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(payment.status)}`}>
            {getStatusText(payment.status)}
          </span>
          <span className="text-gray-500 ml-2 text-sm">
            от {formatDate(payment.date)}
          </span>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-3">Детали платежа</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-2 text-gray-600">ID Платежа:</td>
              <td className="py-2 font-medium">{payment.payment_id}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600">Сумма:</td>
              <td className="py-2 font-medium">{payment.amount} руб.</td>
            </tr>
            {payment.payment_link && (
              <tr>
                <td className="py-2 text-gray-600">Ссылка на оплату:</td>
                <td className="py-2">
                  <a 
                    href={payment.payment_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    Открыть
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Details */}
      {payment.registration?.user && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-3">Пользователь</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-2 text-gray-600">Имя:</td>
                <td className="py-2 font-medium">{payment.registration.user.first_name}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Фамилия:</td>
                <td className="py-2 font-medium">{payment.registration.user.second_name}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Телефон:</td>
                <td className="py-2 font-medium">{payment.registration.user.phone}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Город:</td>
                <td className="py-2 font-medium">{payment.registration.user.city}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tournament Details */}
      {payment.registration?.tournament && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-3">Турнир</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-2 text-gray-600">Название:</td>
                <td className="py-2 font-medium">{payment.registration.tournament.name}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentDetail; 