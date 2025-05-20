import type { Loyalty } from '../shared/types';

interface LoyaltyListProps {
  loyalties: Loyalty[];
  selectedId?: number;
  onSelect: (loyalty: Loyalty) => void;
  onDelete: (id: number) => void;
}

const LoyaltyList = ({ loyalties, selectedId, onSelect, onDelete }: LoyaltyListProps) => {
  // Sort by discount (highest first)
  const sortedLoyalties = [...loyalties]
    .sort((a, b) => b.discount - a.discount);

  if (sortedLoyalties.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        Уровни лояльности не найдены
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sortedLoyalties.map((loyalty) => (
        <div
          key={loyalty.id}
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer
                      ${loyalty.id === selectedId
                        ? 'bg-green-100 border-l-4 border-green-600'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
          onClick={() => onSelect(loyalty)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <h3 className="text-sm font-medium text-gray-900 truncate">{loyalty.name}</h3>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {loyalty.discount}%
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <p className="text-xs text-gray-500">
                {loyalty.users_count ?? 0} пользователей
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(loyalty.id!);
                }}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoyaltyList; 