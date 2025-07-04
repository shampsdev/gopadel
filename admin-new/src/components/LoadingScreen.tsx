import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <div className="text-center">
          <h2 className="text-white text-xl font-semibold">GoPadel</h2>
          <p className="text-zinc-400 text-sm">Загрузка панели администрирования...</p>
        </div>
      </div>
    </div>
  );
}; 