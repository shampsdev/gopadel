// Dashboard service - mock implementation
// In a real application, this would make API calls to a backend server

interface Stat {
  title: string;
  value: number;
  change: string;
  icon: string;
}

interface QuickAction {
  name: string;
  icon: string;
  color: string;
}

interface ActivityItem {
  action: string;
  details: string;
  time: string;
  icon: string;
}

interface NavigationCard {
  title: string;
  icon: string;
  description: string;
  color: string;
  iconBg: string;
  path: string;
}

export interface DashboardData {
  stats: Stat[];
  quickActions: QuickAction[];
  recentActivity: ActivityItem[];
  navigationCards: NavigationCard[];
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    // In a real app, this would be an API call
    // Simulating a network request with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stats: [
            { title: 'Пользователей', value: 1245, change: '+12%', icon: '👤' },
            { title: 'Турниров', value: 48, change: '+3', icon: '🏆' },
            { title: 'Матчей', value: 346, change: '+28', icon: '🏓' },
            { title: 'Локаций', value: 12, change: '+1', icon: '📍' }
          ],
          quickActions: [
            { name: 'Создать турнир', icon: '➕', color: 'bg-blue-500' },
            { name: 'Добавить пользователя', icon: '👤', color: 'bg-green-500' },
            { name: 'Управление матчами', icon: '🏓', color: 'bg-purple-500' },
            { name: 'Настройки системы', icon: '⚙️', color: 'bg-gray-500' }
          ],
          recentActivity: [
            { action: 'Создан турнир', details: 'Чемпионат Москвы 2023', time: '10 минут назад', icon: '🏆' },
            { action: 'Новый пользователь', details: 'Анна Иванова зарегистрировалась', time: '25 минут назад', icon: '👤' },
            { action: 'Завершен матч', details: 'Команда А vs Команда Б (3-1)', time: '1 час назад', icon: '🏓' },
            { action: 'Обновлена локация', details: 'GO PADEL Центр - изменен адрес', time: '2 часа назад', icon: '📍' },
            { action: 'Изменение правил', details: 'Обновлены правила регистрации', time: '3 часа назад', icon: '📝' }
          ],
          navigationCards: [
            { 
              title: 'Управление пользователями', 
              icon: '👥', 
              description: 'Создание, редактирование и управление учетными записями пользователей',
              color: 'bg-blue-50 border-blue-200',
              iconBg: 'bg-blue-100',
              path: '/users' 
            },
            { 
              title: 'Турниры и соревнования', 
              icon: '🏆', 
              description: 'Организация турниров, настройка расписания и просмотр результатов',
              color: 'bg-green-50 border-green-200',
              iconBg: 'bg-green-100',
              path: '/tournaments' 
            },
            { 
              title: 'Администраторы системы', 
              icon: '🔐', 
              description: 'Управление правами доступа и учетными записями администраторов',
              color: 'bg-purple-50 border-purple-200',
              iconBg: 'bg-purple-100',
              path: '/admins' 
            },
            { 
              title: 'Отчеты и аналитика', 
              icon: '📊', 
              description: 'Просмотр статистики и формирование отчетов по работе системы',
              color: 'bg-amber-50 border-amber-200',
              iconBg: 'bg-amber-100',
              path: '/reports' 
            }
          ]
        });
      }, 300);
    });
  }

  async getSystemActivity() {
    // This would be replaced with real chart data in a production app
    return {
      labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'],
      datasets: [
        {
          label: 'Посещения',
          data: [420, 350, 500, 480, 560, 610]
        },
        {
          label: 'Регистрации',
          data: [45, 38, 42, 37, 50, 48]
        }
      ]
    };
  }
}

export const dashboardService = new DashboardService(); 