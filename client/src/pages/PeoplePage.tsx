import { useEffect, useState } from "react"
import Header from "@/components/Header"
import UserCard from "@/components/UserCard"
import { getUsers } from "@/api/api"
import { User } from "@/types/user"
import { Spinner } from "@/components/ui/Spinner"
import { useNavigate } from "react-router-dom"

export default function PeoplePage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const usersData = await getUsers()
        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleUserClick = (userId: string) => {
    navigate(`/people/${userId}`)
  }

  return (
    <div className="p-4 bg-white min-h-screen pb-20">
      <Header />

      <h1 className="text-center font-semibold text-2xl mb-6 mt-2 text-gray-800">
        Люди
      </h1>

      {loading ? (
        <div className="flex justify-center mt-10">
          <Spinner size="lg" />
        </div>
      ) : users.length > 0 ? (
        <div className="flex flex-col">
          {users.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onClick={() => handleUserClick(user.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-10">
          <p className="text-gray-500">Нет доступных пользователей</p>
        </div>
      )}
    </div>
  )
} 