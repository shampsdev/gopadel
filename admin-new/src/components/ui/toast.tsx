import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import type { Toast } from '../../hooks/useToast';

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: 'bg-green-900/20 border-green-800 text-green-400',
  error: 'bg-red-900/20 border-red-800 text-red-400',
  warning: 'bg-yellow-900/20 border-yellow-800 text-yellow-400',
  info: 'bg-blue-900/20 border-blue-800 text-blue-400',
};

export const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const Icon = toastIcons[toast.type];
  const colorClass = toastColors[toast.type];

  return (
    <div className={`flex items-center space-x-3 p-4 rounded-lg border ${colorClass} shadow-lg animate-in slide-in-from-right-full`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(toast.id)}
        className="h-6 w-6 p-0 hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}; 