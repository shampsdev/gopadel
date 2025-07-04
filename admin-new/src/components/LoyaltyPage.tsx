import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { loyaltiesApi, type Loyalty, type CreateLoyalty, type PatchLoyalty } from '../api/loyalties';

export const LoyaltyPage: React.FC = () => {
  const [loyalties, setLoyalties] = useState<Loyalty[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    discount: 0,
    description: '',
    requirements: 'Поле заблокировано для редактирования',
  });

  const toast = useToastContext();
  const { user } = useAuth();
  
  // Проверяем права суперпользователя
  const canEdit = user?.is_superuser || false;

  useEffect(() => {
    loadLoyalties();
  }, []);

  const loadLoyalties = async () => {
    setLoading(true);
    try {
      const data = await loyaltiesApi.getAll();
      setLoyalties(data);
    } catch (error: any) {
      toast.error('Ошибка при загрузке уровней лояльности');
      console.error('Error loading loyalties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const createData: CreateLoyalty = {
        name: formData.name,
        discount: formData.discount,
        description: formData.description,
        requirements: '{}',
      };

      await loyaltiesApi.create(createData);
      toast.success('Уровень лояльности успешно создан');
      
      resetForm();
      loadLoyalties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при создании уровня лояльности');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const patchData: PatchLoyalty = {
        name: formData.name,
        discount: formData.discount,
        description: formData.description,
        requirements: '{}',
      };

      await loyaltiesApi.patch(id, patchData);
      toast.success('Уровень лояльности успешно обновлен');
      
      resetForm();
      loadLoyalties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при обновлении уровня лояльности');
    }
  };

  const handleDelete = async (loyalty: Loyalty) => {
    if (!confirm(`Вы уверены, что хотите удалить уровень лояльности "${loyalty.name}"?`)) {
      return;
    }

    try {
      await loyaltiesApi.delete(loyalty.id);
      toast.success('Уровень лояльности успешно удален');
      loadLoyalties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при удалении уровня лояльности');
    }
  };

  const startEdit = (loyalty: Loyalty) => {
    setEditingId(loyalty.id);
    setIsCreating(false);
    setFormData({
      name: loyalty.name,
      discount: loyalty.discount,
      description: loyalty.description,
      requirements: 'Поле заблокировано для редактирования',
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: '',
      discount: 0,
      description: '',
      requirements: 'Поле заблокировано для редактирования',
    });
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      name: '',
      discount: 0,
      description: '',
      requirements: 'Поле заблокировано для редактирования',
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Название уровня лояльности обязательно');
      return;
    }

    if (formData.discount < 0 || formData.discount > 100) {
      toast.error('Скидка должна быть от 0 до 100%');
      return;
    }

    if (isCreating) {
      await handleCreate();
    } else if (editingId) {
      await handleUpdate(editingId);
    }
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма создания/редактирования */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              {isCreating ? 'Создать уровень лояльности' : editingId ? 'Редактировать уровень лояльности' : 'Форма управления'}
              {(isCreating || editingId) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCreating || editingId ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Название</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="Например: Бронзовый, Серебряный, Золотой"
                    required
                  />
                </div>

                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Скидка (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', parseInt(e.target.value) || 0)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Описание</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px]"
                    placeholder="Описание уровня лояльности"
                  />
                </div>

                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Требования</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    className="bg-zinc-700 border-zinc-600 text-zinc-500 placeholder:text-zinc-500 min-h-[80px] cursor-not-allowed"
                    placeholder="Поле заблокировано для редактирования"
                    disabled
                    readOnly
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? 'Создать' : 'Сохранить'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400 mb-4">
                  {canEdit 
                    ? "Выберите уровень лояльности для редактирования или создайте новый"
                    : "Только суперпользователи могут управлять уровнями лояльности"
                  }
                </p>
                {canEdit && (
                  <Button
                    onClick={startCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Создать новый уровень
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Список уровней лояльности */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Уровни лояльности
              <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                {loyalties.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-zinc-400 mt-2">Загрузка...</p>
              </div>
            ) : loyalties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400">Нет уровней лояльности</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {loyalties.map((loyalty) => (
                    <div
                      key={loyalty.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        editingId === loyalty.id
                          ? 'border-green-600 bg-green-600/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                      onClick={() => canEdit && startEdit(loyalty)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-white font-medium">{loyalty.name}</h3>
                            <Badge variant="outline" className="border-green-600 text-green-300">
                              {loyalty.discount}% скидка
                            </Badge>
                          </div>
                          
                          {loyalty.description && (
                            <p className="text-zinc-400 text-sm mb-2">{loyalty.description}</p>
                          )}
                        </div>
                        
                        {canEdit && (
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(loyalty);
                              }}
                              className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(loyalty);
                              }}
                              className="bg-red-600 border-red-500 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="h-4 w-4" />
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