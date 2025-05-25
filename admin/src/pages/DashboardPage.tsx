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
      <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl text-white p-6 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold">GO PADEL</h1>
        <p className="mt-2 text-green-50">Сегодня {capitalizedToday}</p>
      </div>

      {/* Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboardData?.navigationCards.map((card, index) => (
          <div 
            key={index} 
            className={`${card.color} border rounded-xl p-4 cursor-pointer hover:shadow-md transition`}
            onClick={() => navigate(card.path)}
          >
            <div className="flex items-center space-x-4">
              <div className={`${card.iconBg} text-2xl p-2 rounded-lg`}>{card.icon}</div>
              <div>
                <h3 className="font-semibold text-lg">{card.title}</h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage; 