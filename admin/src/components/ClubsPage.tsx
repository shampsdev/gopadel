import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Edit, Trash2, Save, X, Building2 } from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { clubsApi, type Club, type CreateClub, type PatchClub } from '../api/clubs';

export const ClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
  });

  const toast = useToastContext();
  const { user } = useAuth();
  
  // Проверяем права суперпользователя
  const canEdit = user?.is_superuser || false;

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    setLoading(true);
    try {
      const data = await clubsApi.getAll();
      setClubs(data);
    } catch (error: any) {
      toast.error('Ошибка при загрузке клубов');
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const createData: CreateClub = {
        id: formData.id,
        name: formData.name,
        description: formData.description || undefined,
      };

      await clubsApi.create(createData);
      toast.success('Клуб успешно создан');
      
      resetForm();
      loadClubs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при создании клуба');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const patchData: PatchClub = {
        name: formData.name,
        description: formData.description || undefined,
      };

      await clubsApi.patch(id, patchData);
      toast.success('Клуб успешно обновлен');
      
      resetForm();
      loadClubs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при обновлении клуба');
    }
  };

  const handleDelete = async (club: Club) => {
    if (!confirm(`Вы уверены, что хотите удалить клуб "${club.name}"?`)) {
      return;
    }

    try {
      await clubsApi.delete(club.id);
      toast.success('Клуб успешно удален');
      loadClubs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при удалении клуба');
    }
  };

  const startEdit = (club: Club) => {
    setEditingId(club.id);
    setIsCreating(false);
    setFormData({
      id: club.id,
      name: club.name,
      description: club.description || '',
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      id: '',
      name: '',
      description: '',
    });
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      id: '',
      name: '',
      description: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Название клуба обязательно');
      return;
    }

    if (isCreating && !formData.id.trim()) {
      toast.error('ID клуба обязательно');
      return;
    }

    if (isCreating) {
      await handleCreate();
    } else if (editingId) {
      await handleUpdate(editingId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
              {isCreating ? 'Создать клуб' : editingId ? 'Редактировать клуб' : 'Форма управления'}
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
                {isCreating && (
                  <div>
                    <Label className="text-zinc-300 text-sm font-medium">ID клуба</Label>
                    <Input
                      value={formData.id}
                      onChange={(e) => handleInputChange('id', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 mt-1"
                      placeholder="Например: padel-club-moscow"
                      required
                    />
                  </div>
                )}
                
                {editingId && (
                  <div>
                    <Label className="text-zinc-300 text-sm font-medium">ID клуба</Label>
                    <Input
                      value={formData.id}
                      className="bg-zinc-700 border-zinc-600 text-zinc-400 mt-1"
                      disabled
                    />
                    <p className="text-zinc-500 text-xs mt-1">
                      ID клуба нельзя изменить после создания
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Название</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 mt-1"
                    placeholder="Например: Padel Club Moscow"
                    required
                  />
                </div>

                <div>
                  <Label className="text-zinc-300 text-sm font-medium">Описание</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[60px] md:min-h-[80px] mt-1 resize-none"
                    placeholder="Описание клуба"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 pt-2">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? 'Создать' : 'Сохранить'}
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
                    ? "Выберите клуб для редактирования или создайте новый"
                    : "Только суперпользователи могут управлять клубами"
                  }
                </p>
                {canEdit && (
                  <Button
                    onClick={startCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Создать клуб
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Список клубов */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between text-lg">
              Клубы
              <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                {clubs.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {clubs.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-zinc-400 text-sm md:text-base">Нет клубов</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] md:h-[400px] lg:h-[600px]">
                <div className="space-y-3 md:space-y-4 pr-3">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      className={`p-3 md:p-4 rounded-lg border transition-colors cursor-pointer ${
                        editingId === club.id
                          ? 'border-green-600 bg-green-600/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                      onClick={() => canEdit && startEdit(club)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 md:mb-2">
                            <h3 className="text-white font-medium text-base md:text-lg truncate flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                              {club.name}
                            </h3>
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs w-fit">
                              ID: {club.id}
                            </Badge>
                          </div>
                          
                          {club.description && (
                            <p className="text-zinc-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-2">{club.description}</p>
                          )}

                          {club.userCount !== undefined && (
                            <p className="text-zinc-500 text-xs">
                              Участников: {club.userCount}
                            </p>
                          )}
                        </div>
                        
                        {canEdit && (
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(club);
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
                                handleDelete(club);
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