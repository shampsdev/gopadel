import { useEffect, useState } from 'react';
import type { Participant } from '../shared/types';
import { RegistrationStatus } from '../shared/types';
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchParticipants = async () => {
    if (!tournamentId) return;
    
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

  useEffect(() => {
    fetchParticipants();
  }, [tournamentId]);

  const handleStatusChange = async (registrationId: string, newStatus: RegistrationStatus) => {
    try {
      setUpdatingId(registrationId);
      setError(null);
      setSuccessMessage(null);
      
      await tournamentService.updateRegistrationStatus(registrationId, newStatus);
      
      await fetchParticipants();
      
      setSuccessMessage('Статус успешно обновлен');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при обновлении статуса регистрации');
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && participants.length === 0) {
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
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border text-left">ФИО</th>
              <th className="py-2 px-4 border text-left">Статус</th>
              <th className="py-2 px-4 border text-left">Дата регистрации</th>
              <th className="py-2 px-4 border text-left">Действия</th>
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
                  {participant.status === RegistrationStatus.ACTIVE && <span className="text-green-600">Активный</span>}
                  {participant.status === RegistrationStatus.PENDING && <span className="text-yellow-600">В ожидании</span>}
                  {participant.status === RegistrationStatus.CANCELED && <span className="text-red-600">Отменен</span>}
                  {participant.status === RegistrationStatus.CANCELED_BY_USER && <span className="text-red-600">Отменен пользователем</span>}
                </td>
                <td className="py-2 px-4 border">
                  {formatDate(participant.date)}
                </td>
                <td className="py-2 px-4 border">
                  <div className="flex space-x-2">
                    {updatingId === participant.id ? (
                      <span className="text-gray-500 text-sm">Обновление...</span>
                    ) : (
                      <>
                        {participant.status !== RegistrationStatus.ACTIVE && (
                          <button
                            onClick={() => handleStatusChange(participant.id, RegistrationStatus.ACTIVE)}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-xs"
                          >
                            Активировать
                          </button>
                        )}
                        {participant.status !== RegistrationStatus.PENDING && participant.status !== RegistrationStatus.CANCELED && (
                          <button
                            onClick={() => handleStatusChange(participant.id, RegistrationStatus.PENDING)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded text-xs"
                          >
                            В ожидание
                          </button>
                        )}
                        {participant.status !== RegistrationStatus.CANCELED && (
                          <button
                            onClick={() => handleStatusChange(participant.id, RegistrationStatus.CANCELED)}
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs"
                          >
                            Отменить
                          </button>
                        )}
                      </>
                    )}
                  </div>
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