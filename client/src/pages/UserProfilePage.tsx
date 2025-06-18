import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import Header from "@/components/Header"
import { User } from "@/types/user"
import { Spinner } from "@/components/ui/Spinner"
import { getUserById } from "@/api/api"
import Divider from "@/components/ui/Divider"
import { MessageCircle, User as UserIcon } from "lucide-react"
import { openTelegramLink, backButton } from "@telegram-apps/sdk-react"
import GreenButton from "@/components/ui/GreenButton"
import LoyaltyBadge from "@/components/LoyaltyBadge"
import { getRatingWord } from "@/utils/ratingUtils"
import { getPlayingPositionText } from "@/utils/playingPosition"
import PadelProfilesList from "@/components/PadelProfilesList"
import { FaTelegramPlane } from "react-icons/fa"

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Custom back button handler for this page
    const handleBackClick = () => {
      const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]')
      
      // Check if we came from a tournament page (directly or from participants/waitlist)
      const previousPath = history.length >= 2 ? history[history.length - 2] : null
      
      if (previousPath) {
        // If came from tournament participants or waitlist page
        if (previousPath.includes('/participants') || previousPath.includes('/waitlist')) {
          navigate(previousPath)
          return
        }
        
        // If came directly from a tournament page
        if (previousPath.includes('/tournament/') && !previousPath.includes('/participants') && !previousPath.includes('/waitlist')) {
          navigate(previousPath)
          return
        }
      }
      
      // Default fallback
      navigate('/people')
    }

    // Store the current path in navigation history
    const updateNavigationHistory = () => {
      const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]')
      const currentPath = location.pathname
      
      // Don't add duplicate entries
      if (history.length === 0 || history[history.length - 1] !== currentPath) {
        // Keep only the last 10 entries to avoid excessive storage
        if (history.length >= 10) {
          history.shift()
        }
        history.push(currentPath)
        sessionStorage.setItem('navigationHistory', JSON.stringify(history))
      }
    }
    
    updateNavigationHistory()

    // Show back button and set custom handler
    backButton.show()
    backButton.onClick(handleBackClick)

    return () => {
      // Clean up the custom handler when component unmounts
      backButton.offClick(handleBackClick)
    }
  }, [navigate, location.pathname])

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return
      
      setLoading(true)
      try {
        const foundUser = await getUserById(userId)
        if (foundUser) {
          setUser(foundUser)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  const handleMessage = () => {
    if (user?.username) {
      openTelegramLink(`https://t.me/${user.username}`)
    }
  }

  const openTelegramProfile = () => {
    if (user?.username) {
      openTelegramLink(`https://t.me/${user.username}`)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen pb-20">
        <Header />
        <div className="flex justify-center mt-10">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 bg-white min-h-screen pb-20">
        <Header />
        <div className="flex flex-col items-center justify-center mt-10">
          <p className="text-gray-500">Пользователь не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white min-h-screen pb-20">
      <Header />

      <div className="flex flex-col items-center mb-6 mt-4 relative">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.first_name} ${user.second_name}`}
              className="w-24 h-24 rounded-full object-cover mb-3"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-white font-medium mb-3">
              {user.first_name.charAt(0)}
              {user.second_name.charAt(0)}
            </div>
          )}

          {/* Loyalty badge positioned at the bottom right of avatar */}
          <div className="absolute -bottom-1 -right-1">
            <LoyaltyBadge loyaltyId={user.loyalty_id} size="md" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">
          {user.first_name} {user.second_name}
        </h2>
        {user.username && (
          <div 
            className="flex items-center gap-1 text-blue-500 cursor-pointer"
            onClick={openTelegramProfile}
          >
            <FaTelegramPlane size={14} />
            <p>@{user.username}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Город</span>
          <span className="font-medium">{user.city}</span>
        </div>
        <Divider />

        <div className="flex justify-between py-2">
          <span className="text-gray-500">Рейтинг</span>
          <span className="font-medium">{getRatingWord(user.rank)}</span>
        </div>
        <Divider />

        <div className="flex justify-between py-2">
          <span className="text-gray-500">Квадрат игры</span>
          <span className="font-medium">{getPlayingPositionText(user.playing_position)}</span>
        </div>
        <Divider />

        {user.bio && (
          <div className="py-2">
            <span className="text-gray-500 block mb-2">О себе</span>
            <div className="font-medium break-words whitespace-pre-wrap">{user.bio}</div>
          </div>
        )}
        <Divider />

        {user.padel_profiles && (
          <>
            <div className="py-2">
              <span className="text-gray-500 block mb-2">Профили по падел</span>
              <PadelProfilesList profilesText={user.padel_profiles} />
            </div>
            <Divider />
          </>
        )}

        <div className="flex items-center py-3">
          <div className="flex-1">
            <span className="text-gray-500">Уровень лояльности</span>
            <div className="flex items-center mt-1">
              <LoyaltyBadge loyaltyId={user.loyalty_id} size="sm" />
              <span className="font-medium ml-2">
                {user.loyalty.name}
                {user.loyalty.discount > 0 && ` (${user.loyalty.discount}%)`}
              </span>
            </div>
          </div>
        </div>

        {user.birth_date_ru && (
          <>
            <Divider />
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Дата рождения</span>
              <span className="font-medium">{user.birth_date_ru}</span>
            </div>
          </>
        )}
      </div>

      {user.username && (
        <div className="space-y-3">
          <GreenButton onClick={handleMessage} className="w-full">
            <div className="flex items-center justify-center gap-2">
              <MessageCircle size={20} />
              Написать сообщение
            </div>
          </GreenButton>
          
          <button
            onClick={openTelegramProfile}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors duration-200 border border-blue-200"
          >
            <FaTelegramPlane size={18} />
            <span className="text-sm font-medium">Открыть профиль Telegram</span>
          </button>
        </div>
      )}
    </div>
  )
}
