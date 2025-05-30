import { useState, useEffect } from 'react';
import type { Club } from '../shared/types';
import { clubService } from '../services/club';

const ClubsPage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const data = await clubService.getAll();
      setClubs(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке клубов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleSelectClub = (club: Club) => {
    setSelectedClub(club);
    setIsCreating(false);
    setFormData({
      name: club.name,
      address: club.address
    });
  };

  const handleCreateNew = () => {
    setSelectedClub(null);
    setIsCreating(true);
    setFormData({
      name: '',
      address: ''
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (isCreating) {
        await clubService.create(formData);
      } else if (selectedClub?.id) {
        await clubService.update(selectedClub.id, formData);
      }
      await fetchClubs();
      setIsCreating(false);
      setSelectedClub(null);
      setFormData({ name: '', address: '' });
    } catch (err) {
      setError('Ошибка при сохранении клуба');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот клуб?')) {
      try {
        setLoading(true);
        await clubService.delete(id);
        await fetchClubs();
        if (selectedClub?.id === id) {
          setSelectedClub(null);
        }
      } catch (err) {
        setError('Ошибка при удалении клуба');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setSelectedClub(null);
    setIsCreating(false);
    setFormData({ name: '', address: '' });
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-black mb-6">Клубы</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Club list */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium">Список клубов</h2>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Создать
            </button>
          </div>
          
          <div className="p-2">
            {loading && clubs.length === 0 ? (
              <p className="text-center py-4">Загрузка...</p>
            ) : clubs.length > 0 ? (
              <div className="space-y-2">
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      selectedClub?.id === club.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelectClub(club)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{club.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{club.address}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(club.id);
                        }}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">Нет клубов</p>
            )}
          </div>
        </div>
        
        {/* Right side - Club form */}
        <div className="w-full lg:w-2/3 bg-white rounded-lg shadow mt-4 lg:mt-0">
          {(isCreating || selectedClub) ? (
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">
                {isCreating ? 'Создание нового клуба' : 'Редактирование клуба'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название клуба
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Введите название клуба"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Введите адрес клуба"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={!formData.name.trim() || !formData.address.trim() || loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Выберите клуб из списка или создайте новый
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubsPage; 