import type { Tournament } from '../shared/types';

interface TournamentListProps {
  tournaments: Tournament[];
  selectedId?: number;
  onSelect: (tournament: Tournament) => void;
  onDelete: (id: number) => void;
}

const TournamentList = ({ tournaments, selectedId, onSelect, onDelete }: TournamentListProps) => {
  // Sort by start time (nearest first)
  const sortedTournaments = [...tournaments]
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  if (sortedTournaments.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        Турниры не найдены
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Check if tournament is in the past
  const isPastTournament = (dateString: string): boolean => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="max-h-[500px] overflow-y-auto">
      <div className="space-y-2 p-2">
        {sortedTournaments.map((tournament) => {
          const isPast = isPastTournament(tournament.start_time);
          const isSelected = tournament.id === selectedId;
          
          return (
            <div
              key={tournament.id}
              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'
              } ${isPast ? 'bg-gray-100 opacity-70' : ''}`}
              onClick={() => onSelect(tournament)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium truncate ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                    {tournament.name}
                    {isPast && <span className="ml-2 text-xs text-gray-500 font-normal">(прошедший)</span>}
                  </h3>
                  <div className="mt-1 flex flex-col text-xs text-gray-500">
                    <span>Начало: {formatDate(tournament.start_time)}</span>
                    {tournament.end_time && (
                      <span>Окончание: {formatDate(tournament.end_time)}</span>
                    )}
                    <span>Тип: {tournament.tournament_type}</span>
                    <span>Цена: {tournament.price} ₽</span>
                    {tournament.description && (
                      <span className="truncate" title={tournament.description}>
                        Описание: {tournament.description}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(tournament.id as number);
                  }}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TournamentList; 