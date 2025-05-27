import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/Header"
import { User } from "@/types/user"
import { Spinner } from "@/components/ui/Spinner"
import { getUsers } from "@/api/api"
import Divider from "@/components/ui/Divider"
import { ArrowLeft } from "lucide-react"

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  const handleBack = () => {
    navigate(-1)
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
      
      <div className="flex items-center mb-4">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold ml-2">Профиль пользователя</h1>
      </div>

      <div className="flex flex-col items-center mb-6">
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
        <h2 className="text-2xl font-bold">{user.first_name} {user.second_name}</h2>
        {user.username && <p className="text-gray-500">@{user.username}</p>}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Город</span>
          <span className="font-medium">{user.city}</span>
        </div>
        <Divider />
        
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Ранг</span>
          <span className="font-medium">{user.rank}</span>
        </div>
        <Divider />
        
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Уровень лояльности</span>
          <span className="font-medium">
            {user.loyalty.name}
            {user.loyalty.discount > 0 && ` (скидка ${user.loyalty.discount}%)`}
          </span>
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
    </div>
  )
} 