import { useState, useEffect } from 'react';
import type { Tournament } from '../shared/types';
import { tournamentService } from '../services/tournament';
import TournamentForm from '../components/TournamentForm';
import TournamentList from '../components/TournamentList';
import TournamentParticipants from '../components/TournamentParticipants';
import TournamentWaitlist from '../components/TournamentWaitlist';
import { useLocation } from 'react-router-dom';

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPastTournaments, setShowPastTournaments] = useState(false);
  
  // Search and filter states
  const [nameFilter, setNameFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const [activeTab, setActiveTab] = useState<'edit' | 'participants' | 'waitlist'>('edit');

  const location = useLocation();

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentService.getAll();
      setTournaments(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке турниров');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Выделяем турнир по query-параметру
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tournamentId = params.get('tournamentId');
    if (tournamentId && tournaments.length > 0) {
      const found = tournaments.find(t => String(t.id) === String(tournamentId));
      if (found) setSelectedTournament(found);
    }
  }, [location.search, tournaments]);

  const handleSelectTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedTournament(null);
    setIsCreating(true);
  };

  const handleSave = async (tournament: Tournament) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      let savedTournament: Tournament;
      
      if (isCreating) {
        savedTournament = await tournamentService.create(tournament);
        // После создания оставляем пользователя на форме редактирования созданного турнира
        setIsCreating(false);
        setSelectedTournament(savedTournament);
        setSuccessMessage('Турнир успешно создан!');
      } else if (selectedTournament?.id) {
        savedTournament = await tournamentService.update({
          ...tournament,
          id: selectedTournament.id
        });
        // После обновления оставляем пользователя на той же форме редактирования
        setSelectedTournament(savedTournament);
        setSuccessMessage('Турнир успешно обновлён!');
      }
      
      await fetchTournaments();
      
      // Скрыть уведомление через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при сохранении турнира');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот турнир?')) {
      try {
        setLoading(true);
        await tournamentService.delete(id);
        await fetchTournaments();
        if (selectedTournament?.id === id) {
          setSelectedTournament(null);
        }
      } catch (err) {
        setError('Ошибка при удалении турнира');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearFilters = () => {
    setNameFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  // Apply filters to tournaments
  const filteredTournaments = tournaments.filter(tournament => {
    // Filter by past/upcoming based on checkbox
    if (!showPastTournaments && new Date(tournament.start_time) < new Date()) {
      return false;
    }
    
    // Filter by name (case insensitive)
    if (nameFilter && !tournament.name.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    }
    
    // Filter by start date
    if (startDateFilter && new Date(tournament.start_time) < new Date(startDateFilter)) {
      return false;
    }
    
    // Filter by end date
    if (endDateFilter && new Date(tournament.start_time) > new Date(endDateFilter)) {
      return false;
    }
    
    return true;
  });

  // Right side - Tournament form or details
  const renderRightSide = () => {
    if (isCreating) {
      return (
        <>
          <h2 className="text-lg font-medium mb-4">Создание нового турнира</h2>
          <TournamentForm onSave={handleSave} />
        </>
      );
    } 
    
    if (selectedTournament) {
      return (
        <>
          <div className="border-b mb-4">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('edit')}
                className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'edit'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Редактирование
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'participants'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Участники
              </button>
              <button
                onClick={() => setActiveTab('waitlist')}
                className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'waitlist'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Лист ожидания
              </button>
            </nav>
          </div>

          {activeTab === 'edit' && (
            <>
              <h2 className="text-lg font-medium mb-4">Редактирование турнира</h2>
              <TournamentForm tournament={selectedTournament} onSave={handleSave} />
            </>
          )}

          {activeTab === 'participants' && (
            <TournamentParticipants tournamentId={selectedTournament.id} />
          )}

          {activeTab === 'waitlist' && (
            <TournamentWaitlist tournamentId={selectedTournament.id} />
          )}
        </>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Выберите турнир из списка или создайте новый
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-black mb-6">Турниры</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Tournament list */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium">Список турниров</h2>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Создать
            </button>
          </div>
          
          {/* Filters section */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center text-sm text-green-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {isFilterExpanded ? 'Скрыть фильтры' : 'Показать фильтры'}
              </button>
              {isFilterExpanded && (
                <button 
                  onClick={clearFilters} 
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Сбросить
                </button>
              )}
            </div>
            
            <div className={`space-y-2 ${isFilterExpanded ? 'block' : 'hidden'}`}>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Поиск по названию</label>
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Введите название турнира"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">С даты</label>
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">По дату</label>
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Past tournaments toggle */}
          <div className="p-2 border-b">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={showPastTournaments}
                onChange={() => setShowPastTournaments(!showPastTournaments)}
                className="form-checkbox h-4 w-4 text-green-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Показать прошедшие турниры</span>
            </label>
          </div>
          
          <div className="p-2">
            {loading && tournaments.length === 0 ? (
              <p className="text-center py-4">Загрузка...</p>
            ) : filteredTournaments.length > 0 ? (
              <TournamentList
                tournaments={filteredTournaments}
                onSelect={handleSelectTournament}
                onDelete={handleDelete}
                selectedId={selectedTournament?.id}
              />
            ) : (
              <p className="text-center py-4 text-gray-500">
                {nameFilter || startDateFilter || endDateFilter 
                  ? 'Нет турниров, соответствующих фильтрам' 
                  : 'Нет доступных турниров'}
              </p>
            )}
          </div>
        </div>
        
        {/* Right side - Tournament form */}
        <div className="w-full lg:w-2/3 bg-white rounded-lg shadow mt-4 lg:mt-0">
          {renderRightSide()}
        </div>
      </div>
    </div>
  );
};

export default TournamentsPage; 