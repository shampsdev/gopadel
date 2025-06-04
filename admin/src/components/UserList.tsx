import type { User } from '../shared/types';
import { getRatingWord } from '../utils/ratingUtils';

interface UserListProps {
  users: User[];
  selectedId?: string;
  onSelect: (user: User) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const UserList = ({ users, selectedId, onSelect, currentPage, totalPages, onPageChange }: UserListProps) => {
  if (users.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        Пользователи не найдены
      </div>
    );
  }

  return (
    <div>
      <div className="max-h-[700px] overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li 
              key={user.id}
              className={`relative p-2 hover:bg-gray-50 cursor-pointer 
                ${user.id === selectedId ? 'bg-green-50' : ''}`}
              onClick={() => onSelect(user)}
            >
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                  {user.avatar && (
                    <img src={user.avatar} alt={user.first_name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.second_name}
                  </h3>
                  <div className="mt-1 flex flex-col text-xs text-gray-500 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span>
                        {user.username ? `@${user.username}` : `ID: ${user.telegram_id}`}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${user.is_registered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.is_registered ? 'Рег.' : 'Не рег.'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{user.city}</span>
                      <span>Рейтинг: {getRatingWord(user.rank)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Назад
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Вперед
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Страница <span className="font-medium">{currentPage}</span> из <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Предыдущая</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                        ${currentPage === pageNum ? 'z-10 bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Следующая</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;