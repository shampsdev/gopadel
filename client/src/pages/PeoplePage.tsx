import { useEffect, useState } from "react"
import Header from "@/components/Header"
import UserCard from "@/components/UserCard"
import { getUsers } from "@/api/api"
import { User } from "@/types/user"
import { Spinner } from "@/components/ui/Spinner"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"

export default function PeoplePage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const usersData = await getUsers()
        setUsers(usersData)
        setFilteredUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(user => 
        `${user.first_name} ${user.second_name}`.toLowerCase().includes(query) ||
        (user.username && user.username.toLowerCase().includes(query))
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleUserClick = (userId: string) => {
    navigate(`/people/${userId}`)
  }

  return (
    <div className="p-4 bg-white min-h-screen pb-20">
      <Header />
      
      {/* Search bar */}
      <div className="mt-4 mb-4 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск по имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {searchQuery && (
            <button 
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchQuery("")}
            >
              <span className="text-gray-400 hover:text-gray-600">✕</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <Spinner size="lg" />
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="flex flex-col mt-2">
          {filteredUsers.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onClick={() => handleUserClick(user.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-10">
          <p className="text-gray-500">
            {users.length > 0 
              ? "Пользователи не найдены" 
              : "Нет доступных пользователей"}
          </p>
        </div>
      )}
    </div>
  )
} 