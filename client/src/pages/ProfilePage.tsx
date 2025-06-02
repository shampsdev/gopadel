import Divider from "@/components/ui/Divider"
import GreenButton from "@/components/ui/GreenButton"
import useUserStore from "@/stores/userStore"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Edit, History } from "lucide-react"
import blackLogo from "@/assets/logo-black.png"
import LoyaltyBadge from "@/components/LoyaltyBadge"
import { getRatingWord } from "@/utils/ratingUtils"
import { getPlayingPositionText } from "@/utils/playingPosition"
import PadelProfilesList from "@/components/PadelProfilesList"

export default function ProfilePage() {
  const { userData } = useUserStore()
  const navigate = useNavigate()

  if (!userData) {
    return (
      <div className="p-4 min-h-screen flex flex-col items-center justify-center pb-20">
        <div className="text-gray-500">Загрузка профиля...</div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white min-h-screen flex flex-col pb-20">
      <div>
        <div className="flex items-center justify-between">
          <img src={blackLogo} className="h-5" alt="" />
          <button
            onClick={() => navigate("/profile/edit")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Редактировать профиль"
          >
            <Edit size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="my-4">
          <Divider />
        </div>
      </div>

      {/* Profile header with avatar, loyalty badge and name */}
      <div className="flex flex-col items-center mb-6 mt-4 relative">
        <div className="relative">
          {userData.avatar ? (
            <img 
              src={userData.avatar} 
              alt={`${userData.first_name} ${userData.second_name}`} 
              className="w-24 h-24 rounded-full object-cover mb-3"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-white font-medium mb-3">
              {userData.first_name.charAt(0)}
              {userData.second_name.charAt(0)}
            </div>
          )}
          
          {/* Loyalty badge positioned at the bottom right of avatar */}
          <div className="absolute -bottom-1 -right-1">
            <LoyaltyBadge 
              loyaltyId={userData.loyalty_id} 
              size="md"
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold">{userData.first_name} {userData.second_name}</h2>
        {userData.username && <p className="text-gray-500">@{userData.username}</p>}
      </div>

      {/* User information card */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Город</span>
          <span className="font-medium">{userData.city}</span>
        </div>
        <Divider />
        
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Рейтинг</span>
          <span className="font-medium">{getRatingWord(userData.rank)}</span>
        </div>
        <Divider />

        <div className="flex justify-between py-2">
          <span className="text-gray-500">Квадрат игры</span>
          <span className="font-medium">{getPlayingPositionText(userData.playing_position)}</span>
        </div>
        <Divider />

        {userData.padel_profiles && (
          <>
            <div className="py-2">
              <span className="text-gray-500 block mb-2">Профили по падел</span>
              <PadelProfilesList profilesText={userData.padel_profiles} />
            </div>
            <Divider />
          </>
        )}
        
        {/* Loyalty level section with enhanced styling */}
        <div 
          className="flex items-center py-3 cursor-pointer"
          onClick={() => navigate("/loyalty")}
        >
          <div className="flex-1">
            <span className="text-gray-500">Уровень лояльности</span>
            <div className="flex items-center mt-1">
              <LoyaltyBadge 
                loyaltyId={userData.loyalty_id} 
                size="sm" 
              />
              <span className="font-medium ml-2">{userData.loyalty.name}</span>
            </div>
          </div>
          <ChevronRight className="text-gray-400 h-5 w-5" />
        </div>
        
        {userData.birth_date_ru && (
          <>
            <Divider />
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Дата рождения</span>
              <span className="font-medium">{userData.birth_date_ru}</span>
            </div>
          </>
        )}
      </div>

      {/* Statistics card */}
      {/* <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Статистика</h3>
        <div className="flex justify-center">
          <div className="bg-white rounded p-3 text-center w-36">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-green-600" />
            <div className="text-xl font-bold">
              {userData.registrations?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Турниров</div>
          </div>
        </div>
      </div> */}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 mt-auto">
        <GreenButton
          onClick={() => navigate("/profile/history")}
          buttonClassName="bg-gray-500"
        >
          <div className="flex items-center justify-center gap-2">
            <History size={18} />
            История турниров
          </div>
        </GreenButton>
      </div>
    </div>
  )
}
