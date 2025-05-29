import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Header from "@/components/Header"
import { User } from "@/types/user"
import { Spinner } from "@/components/ui/Spinner"
import { getUsers } from "@/api/api"
import Divider from "@/components/ui/Divider"
import { MessageCircle } from "lucide-react"
import { openTelegramLink } from "@telegram-apps/sdk-react"
import GreenButton from "@/components/ui/GreenButton"
import LoyaltyBadge from "@/components/LoyaltyBadge"
import { getRatingWord } from "@/utils/ratingUtils"
import { getPlayingPositionText } from "@/utils/playingPosition"
import PadelProfilesList from "@/components/PadelProfilesList"

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const users = await getUsers()
        const foundUser = users.find((u: User) => u.id === userId)
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
        {user.username && <p className="text-gray-500">@{user.username}</p>}
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

        <div className="flex justify-between py-2 gap-4">
          <span className="text-gray-500 text-nowrap">О себе</span>
          <span className="font-medium">{user.bio}</span>
        </div>
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
        <GreenButton onClick={handleMessage} className="w-full">
          <div className="flex items-center justify-center gap-2">
            <MessageCircle size={20} />
            Написать сообщение
          </div>
        </GreenButton>
      )}
    </div>
  )
}
