import { useState, useEffect } from 'react';
import { userService } from '../services/user';
import type { User } from '../shared/types';

interface UserAssociationModalProps {
  adminId: string;
  currentUserId?: string;
  onCancel: () => void;
  onSave: (adminId: string, userId: string) => void;
}

const UserAssociationModal = ({
  adminId,
  currentUserId,
  onCancel,
  onSave,
}: UserAssociationModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await userService.getAll(page * LIMIT, LIMIT);
      if (page === 0) {
        setUsers(result.users);
      } else {
        setUsers(prevUsers => [...prevUsers, ...result.users]);
      }
      setHasMore(result.users.length === LIMIT);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      onSave(adminId, selectedUserId);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.second_name}`.toLowerCase();
    const username = user.username?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || username.includes(search);
  });

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(p => p + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Выбор пользователя</h2>
        </div>
        
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Поиск по имени или имени пользователя"
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="p-4 text-red-600">{error}</div>
        )}
        
        <div className="overflow-y-auto flex-grow">
          <div className="space-y-2 p-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedUserId === user.id ? 'bg-green-50 border-green-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                      {user.avatar && (
                        <img src={user.avatar} alt={user.first_name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{user.first_name} {user.second_name}</div>
                      {user.username && <div className="text-sm text-gray-500">@{user.username}</div>}
                      <div className="text-sm text-gray-500">{user.city}, рейтинг: {user.rank}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                {loading ? 'Загрузка...' : 'Пользователи не найдены'}
              </div>
            )}
            
            {hasMore && filteredUsers.length > 0 && (
              <div className="text-center py-2">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="text-green-600 hover:text-green-800 px-4 py-2 disabled:opacity-50"
                >
                  {loading ? 'Загрузка...' : 'Загрузить еще'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedUserId}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAssociationModal; 