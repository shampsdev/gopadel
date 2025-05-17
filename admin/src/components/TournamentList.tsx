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
      <ul className="divide-y divide-gray-200">
        {sortedTournaments.map((tournament) => {
          const isPast = isPastTournament(tournament.start_time);
          
          return (
            <li 
              key={tournament.id}
              className={`relative p-3 hover:bg-gray-50 cursor-pointer 
                ${tournament.id === selectedId ? 'bg-green-50' : ''} 
                ${isPast ? 'bg-gray-100 opacity-70' : ''}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start" onClick={() => onSelect(tournament)}>
                <div className="flex-1 mb-2 sm:mb-0">
                  <h3 className={`text-sm font-medium truncate ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                    {tournament.name}
                    {isPast && <span className="ml-2 text-xs text-gray-500 font-normal">(прошедший)</span>}
                  </h3>
                  <div className="mt-1 flex flex-col text-xs text-gray-500">
                    <span>Дата: {formatDate(tournament.start_time)}</span>
                    <span>Локация: {tournament.location}</span>
                    <span>Цена: {tournament.price} ₽</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(tournament.id as number);
                  }}
                  className="sm:ml-2 p-1 text-gray-400 hover:text-red-500 self-end sm:self-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TournamentList; 