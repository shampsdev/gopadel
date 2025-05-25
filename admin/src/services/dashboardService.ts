// Dashboard service - mock implementation
// In a real application, this would make API calls to a backend server

interface NavigationCard {
  title: string;
  icon: string;
  description: string;
  color: string;
  iconBg: string;
  path: string;
}

export interface DashboardData {
  navigationCards: NavigationCard[];
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    // In a real app, this would be an API call
    // Simulating a network request with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          navigationCards: [
            { 
              title: 'Управление пользователями', 
              icon: '👥', 
              description: 'Управление учетными записями пользователей',
              color: 'bg-blue-50 border-blue-200',
              iconBg: 'bg-blue-100',
              path: '/users' 
            },
            { 
              title: 'Турниры', 
              icon: '🏆', 
              description: 'Управление турнирами и соревнованиями',
              color: 'bg-green-50 border-green-200',
              iconBg: 'bg-green-100',
              path: '/tournaments' 
            },
            { 
              title: 'Платежи', 
              icon: '💰', 
              description: 'Просмотр и управление платежами',
              color: 'bg-indigo-50 border-indigo-200',
              iconBg: 'bg-indigo-100',
              path: '/payments' 
            },
            { 
              title: 'Программа лояльности', 
              icon: '🌟', 
              description: 'Управление уровнями лояльности',
              color: 'bg-yellow-50 border-yellow-200',
              iconBg: 'bg-yellow-100',
              path: '/loyalty' 
            },
            { 
              title: 'Администраторы', 
              icon: '🔐', 
              description: 'Управление правами доступа',
              color: 'bg-purple-50 border-purple-200',
              iconBg: 'bg-purple-100',
              path: '/admins' 
            }
          ]
        });
      }, 300);
    });
  }
}

export const dashboardService = new DashboardService(); 