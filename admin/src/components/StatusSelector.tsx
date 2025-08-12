import React, { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Edit, Save, X, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import type { EventStatus } from '../shared/types';

interface StatusSelectorProps {
  currentStatus: EventStatus;
  eventId: string;
  onStatusChange: (eventId: string, newStatus: EventStatus) => Promise<void>;
  disabled?: boolean;
}

const statusOptions = [
  { 
    value: 'registration' as EventStatus, 
    label: 'Регистрация открыта', 
    color: 'text-green-400', 
    bgColor: 'bg-green-900/30',
    icon: Clock 
  },
  { 
    value: 'full' as EventStatus, 
    label: 'Набор закрыт', 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-900/30',
    icon: Users 
  },
  { 
    value: 'completed' as EventStatus, 
    label: 'Завершено', 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-900/30',
    icon: CheckCircle 
  },
  { 
    value: 'cancelled' as EventStatus, 
    label: 'Отменено', 
    color: 'text-red-400', 
    bgColor: 'bg-red-900/30',
    icon: XCircle 
  },
];

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  eventId,
  onStatusChange,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const currentStatusConfig = statusOptions.find(s => s.value === currentStatus);
  const selectedStatusConfig = statusOptions.find(s => s.value === selectedStatus);

  const handleSave = async () => {
    if (selectedStatus === currentStatus) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onStatusChange(eventId, selectedStatus);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setSelectedStatus(currentStatus); // Откатываем изменения
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Select value={selectedStatus} onValueChange={(value: string) => setSelectedStatus(value as EventStatus)}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-48 hover:bg-zinc-700">
            <SelectValue>
              {selectedStatusConfig && (
                <div className="flex items-center space-x-2 text-white">
                  <selectedStatusConfig.icon className={`h-4 w-4 ${selectedStatusConfig.color}`} />
                  <span className="text-white">{selectedStatusConfig.label}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center space-x-2 text-white hover:text-white">
                  <option.icon className={`h-4 w-4 ${option.color}`} />
                  <span className="text-white">{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleSave}
          disabled={isLoading}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
        >
          <Save className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={handleCancel}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {currentStatusConfig && (
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${currentStatusConfig.bgColor} ${currentStatusConfig.color}`}>
          <currentStatusConfig.icon className="h-4 w-4" />
          <span>{currentStatusConfig.label}</span>
        </div>
      )}
      
      {!disabled && (
        <Button
          onClick={() => setIsEditing(true)}
          size="sm"
          variant="outline"
          className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white h-6 w-6 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}; 