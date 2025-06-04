import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { Tournament } from "@/types/tournament"
import { Waitlist } from "@/types/waitlist"
import { getTournament, getTournamentWaitlist } from "@/api/api"
import Header from "@/components/Header"
import { Spinner } from "@/components/ui/Spinner"
import { Divider } from "@telegram-apps/telegram-ui"
import { getRatingWord } from "@/utils/ratingUtils"

export default function TournamentWaitlistPage() {
  const { id } = useParams<{ id: string }>()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [waitlist, setWaitlist] = useState<Waitlist[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Function to navigate to user profile
  const goToUserProfile = (userId: string) => {
    navigate(`/people/${userId}`)
  }

  const formatMoscowTime = (dateString: string) => {
    const date = new Date(dateString)
    // Add 3 hours for Moscow timezone
    const moscowDate = new Date(date.getTime() + (3 * 60 * 60 * 1000))
    
    const dateFormatted = moscowDate.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    
    const timeFormatted = moscowDate.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
    
    return { date: dateFormatted, time: timeFormatted }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const [tournamentData, waitlistData] = await Promise.all([
          getTournament(id),
          getTournamentWaitlist(id),
        ])

        setTournament(tournamentData)
        setWaitlist(waitlistData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen">
        <Header />
        <div className="text-center py-4">
          <Spinner className="mx-auto text-green-500" />
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="p-4 bg-white min-h-screen">
        <Header />
        <div className="text-center py-4">Турнир не найден</div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white min-h-screen pb-20">
      <Header />

      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Список ожидания</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-700">
            <span className="font-medium">В списке ожидания:</span>{" "}
            {waitlist.length}
          </div>
        </div>

        {waitlist.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Список ожидания пуст</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Divider />
            {waitlist.map((entry) => {
              const fullName = `${entry.user.first_name} ${entry.user.second_name}`
              const { date, time } = formatMoscowTime(entry.date)

              return (
                <React.Fragment key={entry.id}>
                  <div
                    className="flex justify-between items-center cursor-pointer py-3"
                    onClick={() => goToUserProfile(entry.user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {entry.user.avatar ? (
                          <img
                            src={entry.user.avatar}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            {entry.user.first_name.charAt(0)}
                            {entry.user.second_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="leading-tight">
                        <div className="font-medium text-base">
                          {entry.user.first_name} {entry.user.second_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getRatingWord(entry.user.rank)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {date}
                      </div>
                      <div className="text-xs text-gray-400">
                        {time}
                      </div>
                    </div>
                  </div>
                  <Divider />
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 