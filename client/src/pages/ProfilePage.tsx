import Divider from "@/components/ui/Divider"
import GreenButton from "@/components/ui/GreenButton"
import useUserStore from "@/stores/userStore"
import { useNavigate } from "react-router-dom"
import { Edit, History, Trophy } from "lucide-react"
import blackLogo from "@/assets/logo-black.png"

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
    <div className="p-4 min-h-screen flex flex-col pb-20">
      <div>
        <div className="flex items-center">
          <img src={blackLogo} className="h-5" alt="" />
        </div>
        <div className="my-4">
          <Divider />
        </div>
      </div>

      {/* Profile header with avatar and name */}
      <div className="flex flex-col items-center mb-6 mt-4">
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
          <span className="text-gray-500">Ранг</span>
          <span className="font-medium">{userData.rank}</span>
        </div>
        <Divider />
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500">Уровень<br/> лояльности</span>
          <div 
            className="flex items-center cursor-pointer text-gray-600 hover:text-green-600"
            onClick={() => navigate("/loyalty")}
          >
            <span className="font-medium">{userData.loyalty.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
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
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
      </div>

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
        
        <GreenButton
          onClick={() => navigate("/profile/edit")}
        >
          <div className="flex items-center justify-center gap-2">
            <Edit size={18} />
            Редактировать профиль
          </div>
        </GreenButton>
      </div>
    </div>
  )
}
