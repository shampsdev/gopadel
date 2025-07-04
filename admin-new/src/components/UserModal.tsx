import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Edit, Save, X } from 'lucide-react';
import { usersApi } from '../api/users';
import { loyaltiesApi } from '../api/loyalties';
import { useToastContext } from '../contexts/ToastContext';
import { ratingLevels, getRatingLevelName } from '../utils/ratingUtils';
import type { User as UserType, AdminPatchUser } from '../types/user';
import type { Loyalty } from '../api/loyalties';

interface UserModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (user: UserType) => void;
  canEdit: boolean;
  isEditMode?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated,
  canEdit,
  isEditMode = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AdminPatchUser>({});
  const [loyalties, setLoyalties] = useState<Loyalty[]>([]);
  const toast = useToastContext();

  // Загружаем уровни лояльности при открытии модального окна
  useEffect(() => {
    if (isOpen && canEdit) {
      loadLoyalties();
    }
  }, [isOpen, canEdit]);

  // Устанавливаем режим редактирования при открытии
  useEffect(() => {
    if (isOpen) {
      setIsEditing(isEditMode);
    }
  }, [isOpen, isEditMode]);

  const loadLoyalties = async () => {
    try {
      const loyaltiesData = await loyaltiesApi.getAll();
      setLoyalties(loyaltiesData);
    } catch (error: any) {
      console.error('Ошибка загрузки уровней лояльности:', error);
      toast.error('Ошибка при загрузке уровней лояльности');
    }
  };

  React.useEffect(() => {
    if (user && isEditing) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        rank: user.rank,
        city: user.city,
        birthDate: user.birthDate,
        playingPosition: user.playingPosition,
        padelProfiles: user.padelProfiles,
        isRegistered: user.isRegistered,
        loyaltyId: user.loyalty?.id,
      });
    }
  }, [user, isEditing]);

  // Сбрасываем состояние при закрытии модального окна
  React.useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setFormData({});
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedUser = await usersApi.patch(user.id, formData);
      onUserUpdated(updatedUser);
      setIsEditing(false);
      toast.success('Пользователь успешно обновлен');
    } catch (error: any) {
      console.error('Ошибка обновления пользователя:', error);
      toast.error(error.response?.data?.error || 'Ошибка при обновлении пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleInputChange = (field: keyof AdminPatchUser, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPlayingPositionLabel = (position: string) => {
    switch (position) {
      case 'right': return 'Правая';
      case 'left': return 'Левая';
      case 'both': return 'Обе';
      default: return position;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-zinc-700 text-white">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-semibold text-white">
                  {user.firstName} {user.lastName}
                </DialogTitle>
                <p className="text-sm text-zinc-400">@{user.telegramUsername}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Основная информация */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                Основная информация
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Имя</Label>
                  {isEditing ? (
                    <Input
                      value={formData.firstName || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                    />
                  ) : (
                    <p className="mt-1 text-white">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Фамилия</Label>
                  {isEditing ? (
                    <Input
                      value={formData.lastName || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                    />
                  ) : (
                    <p className="mt-1 text-white">{user.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-zinc-300 text-sm font-medium">Telegram ID</Label>
                <p className="mt-1 text-white">{user.telegramId}</p>
              </div>

              <div>
                <Label className="text-zinc-300 text-sm font-medium">Город</Label>
                {isEditing ? (
                  <Input
                    value={formData.city || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('city', e.target.value)}
                    className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                  />
                ) : (
                  <p className="mt-1 text-white">{user.city || 'Не указано'}</p>
                )}
              </div>

              <div>
                <Label className="text-zinc-300 text-sm font-medium">Дата рождения</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('birthDate', e.target.value)}
                    className="mt-1 bg-zinc-800 border-zinc-700 text-white [color-scheme:dark]"
                  />
                ) : (
                  <p className="mt-1 text-white">{user.birthDate || 'Не указано'}</p>
                )}
              </div>

              <div>
                <Label className="text-zinc-300 text-sm font-medium">Биография</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.bio || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
                    className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-white">{user.bio || 'Не указано'}</p>
                )}
              </div>
            </div>

            {/* Игровая информация и настройки */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                Игровая информация
              </h3>

              <div>
                <Label className="text-zinc-300 text-sm font-medium">Рейтинг</Label>
                {isEditing ? (
                  <Select
                    value={formData.rank?.toString() || ''}
                    onValueChange={(value: string) => handleInputChange('rank', parseFloat(value))}
                  >
                    <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white">
                      <span>{formData.rank ? getRatingLevelName(formData.rank) : "Выберите рейтинг"}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {ratingLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 text-white">{getRatingLevelName(user.rank)}</p>
                )}
              </div>

              <div>
                <Label className="text-zinc-300 text-sm font-medium">Игровая позиция</Label>
                {isEditing ? (
                  <Select
                    value={formData.playingPosition || ''}
                    onValueChange={(value: string) => handleInputChange('playingPosition', value)}
                  >
                    <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white">
                      <span>{formData.playingPosition ? getPlayingPositionLabel(formData.playingPosition) : "Выберите позицию"}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="right">Правая</SelectItem>
                      <SelectItem value="left">Левая</SelectItem>
                      <SelectItem value="both">Обе</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 text-white">{getPlayingPositionLabel(user.playingPosition)}</p>
                )}
              </div>

              <div>
                <Label className="text-zinc-300 text-sm font-medium">Профили Padel</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.padelProfiles || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('padelProfiles', e.target.value)}
                    className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                    rows={4}
                    placeholder="Введите ссылки на профили Padel..."
                  />
                ) : (
                  <div className="mt-1">
                    {user.padelProfiles ? (
                      <div className="text-white whitespace-pre-wrap">{user.padelProfiles}</div>
                    ) : (
                      <span className="text-zinc-500">Не указано</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-zinc-300 text-sm font-medium">Уровень лояльности</Label>
                {isEditing ? (
                  <Select
                    value={formData.loyaltyId?.toString() || ''}
                    onValueChange={(value: string) => handleInputChange('loyaltyId', value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white">
                      <span>{formData.loyaltyId ? loyalties.find(l => l.id === formData.loyaltyId)?.name : "Выберите уровень лояльности"}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {loyalties.map((loyalty) => (
                        <SelectItem key={loyalty.id} value={loyalty.id.toString()}>
                          {loyalty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">
                    {user.loyalty ? (
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                          {user.loyalty.name}
                        </Badge>
                        <p className="text-sm text-zinc-400">Скидка: {user.loyalty.discount}%</p>
                        {user.loyalty.description && (
                          <p className="text-sm text-zinc-400">{user.loyalty.description}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-500">Нет</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-zinc-300 text-sm font-medium">Статус регистрации</Label>
                {isEditing ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch
                      checked={formData.isRegistered ?? false}
                      onCheckedChange={(checked: boolean) => handleInputChange('isRegistered', checked)}
                      className={formData.isRegistered ? "bg-green-600" : "bg-zinc-600"}
                    />
                    <Label className="text-zinc-300">Зарегистрирован</Label>
                  </div>
                ) : (
                  <div className="mt-1">
                    <Badge 
                      variant={user.isRegistered ? "default" : "secondary"}
                      className={user.isRegistered ? "bg-green-600 text-white" : "bg-zinc-600 text-zinc-300"}
                    >
                      {user.isRegistered ? 'Зарегистрирован' : 'Не зарегистрирован'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}; 