import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Hash,
  Copy
} from 'lucide-react';
import type { Payment } from '../api/registrations';

interface PaymentModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Ошибка копирования:', err);
  }
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ payment, isOpen, onClose }) => {
  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            Информация о платеже
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Сумма */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Сумма
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold text-white">{payment.amount} ₽</p>
            </CardContent>
          </Card>

          {/* Дата */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Дата создания
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-lg font-medium text-white">{formatDate(payment.date)}</p>
            </CardContent>
          </Card>

          {/* Payment ID */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Payment ID (в YooKassa)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <p className="font-mono text-white">{payment.paymentId}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(payment.paymentId)}
                  className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Кнопка закрытия */}
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
            >
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 