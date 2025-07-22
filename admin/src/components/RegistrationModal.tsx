import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

import { 
  CreditCard,
  ExternalLink,
  Copy,
  AlertCircle
} from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import type { 
  RegistrationWithPayments, 
  Payment
} from '../api/registrations';

interface RegistrationModalProps {
  registration: RegistrationWithPayments | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getPaymentStatusColor = (status: Payment['status']) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-400 bg-yellow-900/20';
    case 'waiting_for_capture':
      return 'text-blue-400 bg-blue-900/20';
    case 'succeeded':
      return 'text-green-400 bg-green-900/20';
    case 'canceled':
      return 'text-red-400 bg-red-900/20';
    default:
      return 'text-gray-400 bg-gray-900/20';
  }
};

const getPaymentStatusLabel = (status: Payment['status']) => {
  switch (status) {
    case 'pending':
      return 'Ожидание';
    case 'waiting_for_capture':
      return 'Ожидает подтверждения';
    case 'succeeded':
      return 'Успешно';
    case 'canceled':
      return 'Отменен';
    default:
      return status;
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Ошибка копирования:', err);
  }
};

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  registration,
  isOpen,
  onClose
}) => {
  const toast = useToastContext();

  if (!registration) return null;

  const handleCopyPaymentId = async (paymentId: string) => {
    await copyToClipboard(paymentId);
    toast.success('Payment ID скопирован');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader onClose={onClose}>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            Платежи регистрации
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Краткая информация */}
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">
                  {registration.user?.firstName} {registration.user?.lastName}
                </h3>
                <p className="text-sm text-zinc-400">@{registration.user?.telegramUsername}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{registration.event?.name}</p>
                <p className="text-sm text-zinc-400">
                  {registration.event && formatDate(registration.event.startTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Платежи */}
          {registration.payments && registration.payments.length > 0 ? (
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium text-zinc-300 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Платежи ({registration.payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {registration.payments.map((payment) => (
                    <div key={payment.id} className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-white font-medium text-lg">{payment.amount} ₽</p>
                          <p className="text-sm text-zinc-400">{formatDate(payment.createdAt)}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                          {getPaymentStatusLabel(payment.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Payment ID:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white text-xs break-all">{payment.paymentId}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyPaymentId(payment.paymentId)}
                              className="h-6 w-6 p-0 hover:bg-zinc-700"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {payment.paymentLink && (
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Ссылка на оплату:</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(payment.paymentLink, '_blank')}
                              className="h-6 text-blue-400 hover:bg-zinc-700 hover:text-blue-300"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Платежей нет</h3>
                <p className="text-zinc-400">Для этой регистрации не найдено платежей</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 