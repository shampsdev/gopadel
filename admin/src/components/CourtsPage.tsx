import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Trash2, Plus, Save, X, Edit } from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { courtsApi, type Court, type CreateCourt, type PatchCourt } from '../api/courts';

export const CourtsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToastContext();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Состояние формы
  const [formData, setFormData] = useState<CreateCourt>({
    name: '',
    address: '',
  });

  // Проверяем права суперпользователя
  const canEdit = user?.is_superuser || false;

  // Загрузка списка кортов
  const loadCourts = async () => {
    try {
      const data = await courtsApi.getAll();
      setCourts(data);
    } catch (error) {
      console.error('Failed to load courts:', error);
      toast.error('Не удалось загрузить список кортов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourts();
  }, []);

  // Создание корта
  const handleCreate = async () => {
    try {
      const createData: CreateCourt = {
        name: formData.name,
        address: formData.address,
      };

      const newCourt = await courtsApi.create(createData);
      setCourts(prev => [...prev, newCourt]);
      toast.success('Корт успешно создан');
      
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при создании корта');
    }
  };

  // Обновление корта
  const handleUpdate = async (id: string) => {
    try {
      const patchData: PatchCourt = {
        name: formData.name,
        address: formData.address,
      };

      const updatedCourt = await courtsApi.patch(id, patchData);
      setCourts(prev => prev.map(court => 
        court.id === id ? updatedCourt : court
      ));
      toast.success('Корт успешно обновлен');
      
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при обновлении корта');
    }
  };

  // Удаление корта
  const handleDelete = async (court: Court) => {
    if (!window.confirm(`Вы уверены, что хотите удалить корт "${court.name}"?`)) {
      return;
    }

    try {
      await courtsApi.delete(court.id);
      setCourts(prev => prev.filter(c => c.id !== court.id));
      
      // Если удаляем редактируемый корт, очищаем форму
      if (editingId === court.id) {
        resetForm();
      }
      
      toast.success('Корт успешно удален');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при удалении корта');
    }
  };

  // Начать редактирование
  const startEdit = (court: Court) => {
    setEditingId(court.id);
    setIsCreating(false);
    setFormData({
      name: court.name,
      address: court.address,
    });
  };

  // Начать создание
  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: '',
      address: '',
    });
  };

  // Сбросить форму
  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      name: '',
      address: '',
    });
  };

  // Обработчик изменения полей
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Название корта обязательно');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Адрес корта обязателен');
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        await handleCreate();
      } else if (editingId) {
        await handleUpdate(editingId);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-zinc-400 mt-2">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Форма создания/редактирования */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between text-lg">
              {isCreating ? 'Создать корт' : editingId ? 'Редактировать корт' : 'Форма управления'}
              {(isCreating || editingId) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isCreating || editingId ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Название</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 mt-1"
                    placeholder="Например: Корт №1, Центральный корт"
                    required
                  />
                </div>

                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Адрес</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px] md:min-h-[100px] mt-1 resize-none"
                    placeholder="Полный адрес корта"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Сохранение...' : (isCreating ? 'Создать' : 'Сохранить')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white flex-1 sm:flex-none"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 md:py-8">
                <p className="text-zinc-400 mb-4 text-sm md:text-base">
                  {canEdit 
                    ? "Выберите корт для редактирования или создайте новый"
                    : "Только суперпользователи могут управлять кортами"
                  }
                </p>
                {canEdit && (
                  <Button
                    onClick={startCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Создать новый корт
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Список кортов */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between text-lg">
              Корты
              <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                {courts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {courts.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-zinc-400 text-sm md:text-base">Нет кортов</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] md:h-[400px] lg:h-[600px]">
                <div className="space-y-3 md:space-y-4 pr-3">
                  {courts.map((court) => (
                    <div
                      key={court.id}
                      className={`p-3 md:p-4 rounded-lg border transition-colors cursor-pointer ${
                        editingId === court.id
                          ? 'border-green-600 bg-green-600/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                      onClick={() => canEdit && startEdit(court)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-base md:text-lg mb-1 md:mb-2 truncate">{court.name}</h3>
                          <p className="text-zinc-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3">{court.address}</p>
                        </div>
                        
                        {canEdit && (
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(court);
                              }}
                              className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(court);
                              }}
                              className="bg-red-600 border-red-500 hover:bg-red-700 text-white h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 