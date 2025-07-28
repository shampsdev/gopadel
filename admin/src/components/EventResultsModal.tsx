import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Trash2, Save, Trophy, Medal, Target, Users } from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { eventsApi, type Event, type AdminPatchEvent } from '../api/events';
import { registrationsApi, type RegistrationWithPayments } from '../api/registrations';
import type { 
  LeaderboardEntry, 
  GameResult, 
  TournamentResult, 
  GameData, 
  TournamentData,
  User 
} from '../shared/types';

interface EventResultsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface ParticipantOption {
  userId: string;
  user: User;
  place?: number;
}

export const EventResultsModal: React.FC<EventResultsModalProps> = ({
  event,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [participants, setParticipants] = useState<ParticipantOption[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [newParticipant, setNewParticipant] = useState<string>('');

  const toast = useToastContext();

  useEffect(() => {
    if (event && isOpen) {
      loadEventData();
    }
  }, [event, isOpen]);

  const loadEventData = async () => {
    if (!event) return;

    setLoading(true);
    try {
      // Загружаем участников события
      const registrations = await registrationsApi.filter({ eventId: event.id });
      const confirmedParticipants = registrations
        .filter(reg => reg.status === 'CONFIRMED' && reg.user)
        .map(reg => ({
          userId: reg.userId,
          user: reg.user!
        }));

      setParticipants(confirmedParticipants);

      // Загружаем существующие результаты из event.data
      if (event.data) {
        if (event.type === 'game') {
          const gameData = event.data as GameData;
          setLeaderboard(gameData.result?.leaderboard || []);
        } else if (event.type === 'tournament') {
          const tournamentData = event.data as TournamentData;
          setLeaderboard(tournamentData.result?.leaderboard || []);
        }
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      toast.error('Ошибка при загрузке данных события');
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLeaderboard = () => {
    if (!newParticipant) return;

    const participant = participants.find(p => p.userId === newParticipant);
    if (!participant) return;

    // Проверяем, что участник еще не добавлен
    if (leaderboard.some(entry => entry.userId === newParticipant)) {
      toast.error('Участник уже добавлен в результаты');
      return;
    }

    const nextPlace = leaderboard.length + 1;
    setLeaderboard(prev => [...prev, { place: nextPlace, userId: newParticipant }]);
    setNewParticipant('');
  };

  const handleRemoveFromLeaderboard = (userId: string) => {
    setLeaderboard(prev => {
      const filtered = prev.filter(entry => entry.userId !== userId);
      // Пересчитываем места
      return filtered.map((entry, index) => ({ ...entry, place: index + 1 }));
    });
  };

  const handleMoveUp = (userId: string) => {
    setLeaderboard(prev => {
      const index = prev.findIndex(entry => entry.userId === userId);
      if (index <= 0) return prev;

      const newLeaderboard = [...prev];
      [newLeaderboard[index - 1], newLeaderboard[index]] = [newLeaderboard[index], newLeaderboard[index - 1]];
      
      // Обновляем места
      return newLeaderboard.map((entry, idx) => ({ ...entry, place: idx + 1 }));
    });
  };

  const handleMoveDown = (userId: string) => {
    setLeaderboard(prev => {
      const index = prev.findIndex(entry => entry.userId === userId);
      if (index >= prev.length - 1) return prev;

      const newLeaderboard = [...prev];
      [newLeaderboard[index], newLeaderboard[index + 1]] = [newLeaderboard[index + 1], newLeaderboard[index]];
      
      // Обновляем места
      return newLeaderboard.map((entry, idx) => ({ ...entry, place: idx + 1 }));
    });
  };

  const handleSave = async () => {
    if (!event) return;

    setSaving(true);
    try {
      let updatedData: any;

      const eventData = event.data as any;

      if (event.type === 'game') {
        updatedData = {
          ...eventData,
          game: { 
            type: eventData?.game?.type || eventData?.gameType || 'americano' 
          },
          result: { leaderboard }
        };
      } else {
        updatedData = {
          ...eventData,
          tournament: { 
            type: eventData?.tournament?.type || eventData?.tournamentType || 'americano' 
          },
          result: { leaderboard }
        };
      }

      const updatePayload: AdminPatchEvent = {
        data: updatedData
      };

      await eventsApi.patch(event.id, updatePayload);
      toast.success('Результаты сохранены');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Ошибка при сохранении результатов');
      console.error('Error saving results:', error);
    } finally {
      setSaving(false);
    }
  };

  const getParticipantName = (userId: string) => {
    const participant = participants.find(p => p.userId === userId);
    return participant ? `${participant.user.firstName} ${participant.user.lastName}` : 'Неизвестный участник';
  };

  const getPlaceIcon = (place: number) => {
    switch (place) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Target className="h-5 w-5 text-zinc-400" />;
    }
  };

  const availableParticipants = participants.filter(
    p => !leaderboard.some(entry => entry.userId === p.userId)
  );

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader onClose={onClose}>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            {event.type === 'tournament' ? (
              <Trophy className="h-5 w-5 text-yellow-400" />
            ) : (
              <Target className="h-5 w-5 text-green-400" />
            )}
            Результаты {event.type === 'tournament' ? 'турнира' : 'игры'}: {event.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-zinc-400">Загрузка...</div>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">Нет участников</h3>
            <p className="text-zinc-400 mb-6">
              В этом {event.type === 'tournament' ? 'турнире' : 'мероприятии'} пока нет подтвержденных участников.
            </p>
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Закрыть
            </Button>
          </div>
        ) : (
          <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Добавление участников */}
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-lg text-zinc-300 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить в результаты
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Select value={newParticipant} onValueChange={setNewParticipant}>
                      <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white flex-1">
                        <SelectValue placeholder="Выберите участника" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {availableParticipants.map((participant) => (
                          <SelectItem key={participant.userId} value={participant.userId}>
                            {participant.user.firstName} {participant.user.lastName}
                            {participant.user.telegramUsername && (
                              <span className="text-zinc-400 ml-1">
                                (@{participant.user.telegramUsername})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleAddToLeaderboard}
                      disabled={!newParticipant || availableParticipants.length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {availableParticipants.length === 0 && (
                    <div className="text-sm text-zinc-400 text-center py-4">
                      Все участники добавлены в результаты
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Текущие результаты */}
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-lg text-zinc-300 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Таблица результатов ({leaderboard.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {leaderboard.length === 0 ? (
                      <div className="text-sm text-zinc-400 text-center py-8">
                        Результаты пока не добавлены
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {leaderboard.map((entry) => (
                          <div
                            key={entry.userId}
                            className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-700"
                          >
                            <div className="flex items-center gap-3">
                              {getPlaceIcon(entry.place)}
                              <div>
                                <Badge variant={entry.place <= 3 ? "default" : "secondary"} className="mr-2">
                                  {entry.place} место
                                </Badge>
                                <span className="text-white font-medium">
                                  {getParticipantName(entry.userId)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveUp(entry.userId)}
                                disabled={entry.place === 1}
                                className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                              >
                                ↑
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveDown(entry.userId)}
                                disabled={entry.place === leaderboard.length}
                                className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                              >
                                ↓
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveFromLeaderboard(entry.userId)}
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить результаты'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 