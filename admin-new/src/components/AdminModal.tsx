import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Eye, EyeOff, Edit, Save, X } from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { adminsApi } from '../api/admins';
import { usersApi } from '../api/users';
import type { AdminUser, CreateAdminUser, PatchAdminUser } from '../types/admin';
import type { User } from '../types/user';

interface AdminModalProps {
  admin: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isEditMode?: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  admin,
  isOpen,
  onClose,
  onSuccess,
  isEditMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    user_id: '',
    is_superuser: false,
    is_active: true,
  });

  const toast = useToastContext();

  // Устанавливаем режим редактирования при открытии
  useEffect(() => {
    if (isOpen) {
      // Если admin = null, то это создание нового
      // Если isEditMode = true, то это редактирование
      // Иначе это просмотр
      setIsEditing(!admin || isEditMode);
    }
  }, [isOpen, admin, isEditMode]);

  // Загружаем пользователей при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const usersData = await usersApi.getAll();
      setUsers(usersData);
    } catch (error: any) {
      console.error('Ошибка загрузки пользователей:', error);
      toast.error('Ошибка при загрузке пользователей');
    }
  };

  React.useEffect(() => {
    if (admin && isEditing) {
      setFormData({
        username: admin.username,
        password: '',
        first_name: admin.first_name,
        last_name: admin.last_name,
        user_id: admin.user_id,
        is_superuser: admin.is_superuser,
        is_active: admin.is_active,
      });

      setUserSearchTerm(admin.user?.telegramUsername || '');
    } else if (!admin) {
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        user_id: '',
        is_superuser: false,
        is_active: true,
      });
      setUserSearchTerm('');
    }
  }, [admin, isEditing]);

  // Сбрасываем состояние при закрытии модального окна
  React.useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        user_id: '',
        is_superuser: false,
        is_active: true,
      });
      setUserSearchTerm('');
      setShowSearchResults(false);
    }
  }, [isOpen]);

  // Обработчик клика вне области для скрытия результатов поиска
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Найдем пользователя по username
      const selectedUser = users.find(user => 
        user.telegramUsername.toLowerCase() === userSearchTerm.toLowerCase()
      );
      
      if (!selectedUser) {
        toast.error('Пользователь с таким username не найден');
        setIsLoading(false);
        return;
      }

      const dataToSave = {
        ...formData,
        user_id: selectedUser.id,
      };

      if (admin && isEditing) {
        // Обновляем админа
        const updateData: PatchAdminUser = {
          username: dataToSave.username,
          first_name: dataToSave.first_name,
          last_name: dataToSave.last_name,
          user_id: dataToSave.user_id,
          is_superuser: dataToSave.is_superuser,
          is_active: dataToSave.is_active,
        };

        // Добавляем пароль только если он указан
        if (dataToSave.password.trim()) {
          updateData.password = dataToSave.password;
        }

        await adminsApi.patch(admin.id, updateData);
        toast.success('Администратор успешно обновлен');
      } else {
        // Создаем нового админа
        const createData: CreateAdminUser = {
          username: dataToSave.username,
          password: dataToSave.password,
          first_name: dataToSave.first_name,
          last_name: dataToSave.last_name,
          user_id: dataToSave.user_id,
          is_superuser: dataToSave.is_superuser,
          is_active: dataToSave.is_active,
        };

        await adminsApi.create(createData);
        toast.success('Администратор успешно создан');
      }

      onSuccess();
      setIsEditing(false);
      onClose();
    } catch (error: any) {
      console.error('Ошибка сохранения администратора:', error);
      toast.error(error.response?.data?.error || 'Ошибка при сохранении администратора');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      user_id: '',
      is_superuser: false,
      is_active: true,
            });
        setUserSearchTerm('');
    setShowSearchResults(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Фильтруем пользователей по введенному тексту
  const filteredUsers = users.filter(user =>
    user.telegramUsername.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(userSearchTerm.toLowerCase())
  ).slice(0, 5); // Показываем только первые 5 результатов

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {admin && (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={admin.user?.avatar} alt={`${admin.first_name} ${admin.last_name}`} />
                  <AvatarFallback className="bg-zinc-700 text-white">
                    {getInitials(admin.first_name, admin.last_name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <DialogTitle className="text-xl font-semibold text-white">
                  {admin ? `${admin.first_name} ${admin.last_name}` : 'Новый администратор'}
                </DialogTitle>
                {admin && (
                  <p className="text-sm text-zinc-400">@{admin.username}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {admin && (
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
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
              Основная информация
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 text-sm font-medium">Имя</Label>
                {isEditing || !admin ? (
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="Введите имя"
                    required
                  />
                ) : (
                  <p className="text-white py-2">{admin.first_name}</p>
                )}
              </div>
              
              <div>
                <Label className="text-zinc-300 text-sm font-medium">Фамилия</Label>
                {isEditing || !admin ? (
                  <Input
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="Введите фамилию"
                    required
                  />
                ) : (
                  <p className="text-white py-2">{admin.last_name}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-zinc-300 text-sm font-medium">Имя пользователя</Label>
              {isEditing || !admin ? (
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  placeholder="Введите имя пользователя"
                  required
                />
              ) : (
                <p className="text-white py-2">@{admin.username}</p>
              )}
            </div>

            <div>
              <Label className="text-zinc-300 text-sm font-medium">Username связанного пользователя</Label>
              {isEditing || !admin ? (
                <div className="relative user-search-container">
                  <Input
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="Введите username пользователя"
                    required
                  />
                  {showSearchResults && userSearchTerm && filteredUsers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-md mt-1 max-h-40 overflow-y-auto z-50">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            setUserSearchTerm(user.telegramUsername);
                            setShowSearchResults(false);
                          }}
                          className="flex items-center space-x-2 p-2 hover:bg-zinc-700 cursor-pointer"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback className="bg-zinc-700 text-white text-xs">
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white text-sm">@{user.telegramUsername}</p>
                            <p className="text-zinc-400 text-xs">{user.firstName} {user.lastName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2">
                  {admin.user ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={admin.user.avatar} alt={`${admin.user.firstName} ${admin.user.lastName}`} />
                        <AvatarFallback className="bg-zinc-700 text-white text-xs">
                          {getInitials(admin.user.firstName, admin.user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white">@{admin.user.telegramUsername}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-500">Не привязан</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Пароль */}
          {(isEditing || !admin) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                Пароль
              </h3>
              
              <div className="relative">
                <Label className="text-zinc-300 text-sm font-medium">
                  {admin ? 'Новый пароль (оставьте пустым, чтобы не изменять)' : 'Пароль'}
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                    placeholder="Введите пароль"
                    required={!admin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Права доступа */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
              Права доступа
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Суперпользователь</Label>
                  <p className="text-xs text-zinc-500">Полный доступ ко всем функциям</p>
                </div>
                {isEditing || !admin ? (
                  <Switch
                    checked={formData.is_superuser}
                    onCheckedChange={(checked) => handleInputChange('is_superuser', checked)}
                    className={formData.is_superuser ? "bg-blue-600" : "bg-zinc-600"}
                  />
                ) : (
                  <Badge 
                    variant="outline" 
                    className={admin.is_superuser ? "border-red-600 text-red-300" : "border-zinc-600 text-zinc-300"}
                  >
                    {admin.is_superuser ? 'Да' : 'Нет'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {(isEditing || !admin) && (
          <DialogFooter className="mt-6">
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={admin ? handleCancel : onClose}
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {admin ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}; 