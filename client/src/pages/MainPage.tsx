import React, { useState } from "react"
import TournamentList from "@/components/TournamentList"
import { Trophy, Calendar, Gamepad2, Target } from "lucide-react"

type ContentType = 'all' | 'tournaments' | 'games' | 'training'

export default function MainPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('all')

  const tabs = [
    { key: 'all', label: 'Все', icon: Calendar },
    { key: 'tournaments', label: 'Турниры', icon: Trophy },
    { key: 'games', label: 'Игры', icon: Gamepad2 },
    { key: 'training', label: 'Тренировки', icon: Target }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'all':
        return <TournamentList showAvailableFilter={false} availableOnly={true} />
      case 'tournaments':
        return <TournamentList showAvailableFilter={false} availableOnly={true} />
      case 'games':
        return (
          <div className="w-full max-w-md mx-auto text-center py-8">
            <div className="text-gray-500 text-lg mb-2">🎮</div>
            <div className="text-gray-700 font-medium">Coming soon</div>
            <div className="text-gray-500 text-sm">Игры скоро появятся</div>
          </div>
        )
      case 'training':
        return (
          <div className="w-full max-w-md mx-auto text-center py-8">
            <div className="text-gray-500 text-lg mb-2">🏋️</div>
            <div className="text-gray-700 font-medium">Coming soon</div>
            <div className="text-gray-500 text-sm">Тренировки скоро появятся</div>
          </div>
        )
      default:
        return <TournamentList showAvailableFilter={false} availableOnly={true} />
    }
  }

  return (
    <div className="p-4 bg-white min-h-screen pb-20">
      {/* Content Type Navigation */}
      <div className="mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1 max-w-md mx-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ContentType)}
                className={`flex-1 py-2 px-2 text-sm font-medium rounded-md transition-colors duration-150 flex flex-col items-center gap-0.5 ${
                  activeTab === tab.key
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconComponent size={16} />
                <span className="text-xs">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}
