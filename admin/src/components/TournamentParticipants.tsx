import { useEffect, useState } from 'react';
import type { Participant } from '../shared/types';
import { tournamentService } from '../services/tournament';

interface TournamentParticipantsProps {
  tournamentId: number | undefined;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
};

const TournamentParticipants: React.FC<TournamentParticipantsProps> = ({ tournamentId }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) return;

    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const data = await tournamentService.getParticipants(tournamentId);
        setParticipants(data);
        setError(null);
      } catch (err) {
        setError('Ошибка при загрузке списка участников');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
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

  if (participants.length === 0) {
    return <div className="text-gray-500 text-center py-4">Нет зарегистрированных участников</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Список участников ({participants.length})</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border text-left">ФИО</th>
              <th className="py-2 px-4 border text-left">Статус</th>
              <th className="py-2 px-4 border text-left">Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={participant.id}>
                <td className="py-2 px-4 border">
                  <div className="flex items-center">
                    <img 
                      src={participant.user.avatar || '/default-avatar.png'} 
                      alt={`${participant.user.first_name} ${participant.user.second_name}`}
                      className="w-8 h-8 rounded-full mr-2" 
                    />
                    <div className="leading-tight">
                      <div className="font-medium">{participant.user.first_name} {participant.user.second_name}</div>
                      <div className="text-sm text-gray-600">@{participant.user.username || 'без имени пользователя'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-4 border">
                  {participant.status === 'active' && <span className="text-green-600">Активный</span>}
                  {participant.status === 'pending' && <span className="text-yellow-600">В ожидании</span>}
                  {participant.status === 'canceled' && <span className="text-red-600">Отменен</span>}
                  {participant.status === 'canceled_by_user' && <span className="text-red-600">Отменен пользователем</span>}
                </td>
                <td className="py-2 px-4 border">
                  {formatDate(participant.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TournamentParticipants; 