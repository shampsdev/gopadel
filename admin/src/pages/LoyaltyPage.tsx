import { useState, useEffect } from 'react';
import type { Loyalty } from '../shared/types';
import { loyaltyService } from '../services/loyalty';
import LoyaltyForm from '../components/LoyaltyForm';
import LoyaltyList from '../components/LoyaltyList';

const LoyaltyPage = () => {
  const [loyalties, setLoyalties] = useState<Loyalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoyalty, setSelectedLoyalty] = useState<Loyalty | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [nameFilter, setNameFilter] = useState('');

  const fetchLoyalties = async () => {
    try {
      setLoading(true);
      const data = await loyaltyService.getAll();
      setLoyalties(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке уровней лояльности');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyalties();
  }, []);

  const handleSelectLoyalty = (loyalty: Loyalty) => {
    setSelectedLoyalty(loyalty);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedLoyalty(null);
    setIsCreating(true);
  };

  const handleSave = async (loyalty: Loyalty) => {
    try {
      setLoading(true);
      let savedLoyalty: Loyalty;
      
      if (isCreating) {
        savedLoyalty = await loyaltyService.create(loyalty);
      } else if (selectedLoyalty?.id) {
        savedLoyalty = await loyaltyService.update({
          ...loyalty,
          id: selectedLoyalty.id
        });
      } else {
        throw new Error('Invalid state');
      }
      
      // Fetch updated data and keep the saved loyalty selected
      const updatedLoyalties = await loyaltyService.getAll();
      setLoyalties(updatedLoyalties);
      
      // Find the saved loyalty in the updated list by ID
      const updatedLoyalty = updatedLoyalties.find(item => item.id === savedLoyalty.id);
      
      if (updatedLoyalty) {
        setSelectedLoyalty(updatedLoyalty);
      }
      
      setIsCreating(false);
    } catch (err) {
      setError('Ошибка при сохранении уровня лояльности');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот уровень лояльности?')) {
      try {
        setLoading(true);
        await loyaltyService.delete(id);
        await fetchLoyalties();
        if (selectedLoyalty?.id === id) {
          setSelectedLoyalty(null);
        }
      } catch (err) {
        setError('Ошибка при удалении уровня лояльности');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter loyalties by name
  const filteredLoyalties = loyalties.filter(loyalty => {
    if (nameFilter && !loyalty.name.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-black mb-6">Уровни лояльности</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Loyalty list */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium">Список уровней</h2>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Создать
            </button>
          </div>
          
          {/* Filter input */}
          <div className="p-3 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {nameFilter && (
                <button
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setNameFilter('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="p-2">
            {loading && loyalties.length === 0 ? (
              <p className="text-center py-4">Загрузка...</p>
            ) : filteredLoyalties.length > 0 ? (
              <LoyaltyList
                loyalties={filteredLoyalties}
                onSelect={handleSelectLoyalty}
                onDelete={handleDelete}
                selectedId={selectedLoyalty?.id}
              />
            ) : (
              <p className="text-center py-4 text-gray-500">
                {nameFilter ? 'Нет уровней, соответствующих фильтру' : 'Нет доступных уровней лояльности'}
              </p>
            )}
          </div>
        </div>
        
        {/* Right side - Loyalty form */}
        <div className="w-full lg:w-2/3 bg-white rounded-lg shadow p-6">
          {isCreating ? (
            <>
              <h2 className="text-lg font-medium mb-4">Создание нового уровня лояльности</h2>
              <LoyaltyForm onSave={handleSave} />
            </>
          ) : selectedLoyalty ? (
            <>
              <h2 className="text-lg font-medium mb-4">Редактирование уровня лояльности</h2>
              <LoyaltyForm loyalty={selectedLoyalty} onSave={handleSave} />
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Выберите уровень лояльности из списка или создайте новый
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPage; 