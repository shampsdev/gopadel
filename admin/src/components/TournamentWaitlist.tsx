import { useEffect, useState } from 'react';
import type { WaitlistEntry } from '../shared/types';
import { tournamentService } from '../services/tournament';

interface TournamentWaitlistProps {
  tournamentId: number | undefined;
}

const TournamentWaitlist: React.FC<TournamentWaitlistProps> = ({ tournamentId }) => {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) return;

    const fetchWaitlist = async () => {
      try {
        setLoading(true);
        const data = await tournamentService.getWaitlist(tournamentId);
        setWaitlist(data);
        setError(null);
      } catch (err) {
        setError('Ошибка при загрузке листа ожидания');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlist();
  }, [tournamentId]);

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (waitlist.length === 0) {
    return <div className="text-gray-500 text-center py-4">Лист ожидания пуст</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Лист ожидания ({waitlist.length})</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border text-left">ФИО</th>
              <th className="py-2 px-4 border text-left">Дата добавления</th>
            </tr>
          </thead>
          <tbody>
            {waitlist.map((entry) => (
              <tr key={entry.id}>
                <td className="py-2 px-4 border">
                  <div className="flex items-center">
                    <img 
                      src={entry.user.avatar} 
                      alt={`${entry.user.first_name} ${entry.user.second_name}`}
                      className="w-8 h-8 rounded-full mr-2" 
                    />
                    <span>{entry.user.first_name} {entry.user.second_name}</span>
                  </div>
                </td>
                <td className="py-2 px-4 border">
                  {new Date(entry.date).toLocaleString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TournamentWaitlist; 