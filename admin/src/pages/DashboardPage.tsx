import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import type { DashboardData } from '../services/dashboardService';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get today's date in Russian format
  const today = new Date().toLocaleDateString('ru-RU', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // First letter uppercase
  const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-3 text-gray-600">Загружаем данные...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl text-white p-6 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 text-9xl">🏓</div>
        <h1 className="text-2xl md:text-3xl font-bold">Добро пожаловать в GO PADEL Admin!</h1>
        <p className="mt-2 text-green-50">Сегодня {capitalizedToday}</p>
        <p className="mt-1 max-w-2xl">
          Управляйте турнирами, пользователями и настройками системы из единой панели администратора.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-black">Панель администратора</h1>
          <p className="text-gray-700">Все инструменты управления в одном месте</p>
        </div>
        {/* <div className="flex space-x-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Экспорт данных
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Отчеты
          </button>
        </div> */}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboardData?.navigationCards.map((card, index) => (
          <div 
            key={index} 
            className={`${card.color} border rounded-xl p-4 cursor-pointer hover:shadow-md transition`}
            onClick={() => navigate(card.path)}
          >
            <div className="flex items-start space-x-4">
              <div className={`${card.iconBg} text-3xl p-3 rounded-lg`}>{card.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{card.title}</h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
                <button className="mt-2 text-sm font-medium text-blue-600 hover:underline">
                  Перейти →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage; 