import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"

import { Tournament } from "@/types/tournament"
import { Registration } from "@/types/registration"
import { getTournament, getTournamentParticipants } from "@/api/api"
import Header from "@/components/Header"
import { IoIosArrowBack } from "react-icons/io"
import { Spinner } from "@/components/ui/Spinner"
import { Divider } from "@telegram-apps/telegram-ui"

export default function TournamentParticipantsPage() {
  const { id } = useParams<{ id: string }>()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const [tournamentData, registrationsData] = await Promise.all([
          getTournament(id),
          getTournamentParticipants(id),
        ])

        setTournament(tournamentData)
        setRegistrations(registrationsData)
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
    <div className="p-4 bg-white min-h-screen">
      <Header />

      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Участники турнира</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-700">
            <span className="font-medium">Всего участников:</span>{" "}
            {registrations.length}
          </div>
          {tournament && (
            <div className="text-gray-700">
              <span className="font-medium">Максимум:</span>{" "}
              {tournament.max_users}
            </div>
          )}
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-8">
            <p>Пока нет участников</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Divider />
            {registrations.map((registration) => (
              <>
                <div
                  key={registration.user.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      {registration.user.avatar ? (
                        <img
                          src={registration.user.avatar}
                          alt={`${registration.user.first_name} ${registration.user.second_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          {registration.user.first_name.charAt(0)}
                          {registration.user.second_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="text-center font-medium">
                      {registration.user.second_name}{" "}
                      {registration.user.first_name}
                    </p>
                  </div>
                  <div className="opacity-50">
                    ранг: {registration.user.rank}
                  </div>
                </div>
                <Divider />
              </>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
