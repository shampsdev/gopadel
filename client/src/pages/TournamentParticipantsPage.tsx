import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { Tournament } from "@/types/tournament"
import { Registration, RegistrationStatus } from "@/types/registration"
import { getTournament, getTournamentParticipants } from "@/api/api"
import Header from "@/components/Header"
import { Spinner } from "@/components/ui/Spinner"
import { Divider } from "@telegram-apps/telegram-ui"
import { getRatingWord } from "@/utils/ratingUtils"
import { cn } from "@/lib/utils"

export default function TournamentParticipantsPage() {
  const { id } = useParams<{ id: string }>()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Function to navigate to user profile
  const goToUserProfile = (userId: string) => {
    navigate(`/people/${userId}`)
  }

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
        // Filter out participants with CANCELED status
        const activeRegistrations = registrationsData.filter(
          (registration) => registration.status !== RegistrationStatus.CANCELED
        )
        setRegistrations(activeRegistrations)
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
            {registrations.map((registration) => {
              // Combine first and last name
              const fullName = `${registration.user.first_name} ${registration.user.second_name}`

              return (
                <React.Fragment key={registration.user.id}>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => goToUserProfile(registration.user.id)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3",
                        registration.status === RegistrationStatus.PENDING && "opacity-50",
                        registration.status === RegistrationStatus.CANCELED_BY_USER && "opacity-75"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0",
                        registration.status === RegistrationStatus.CANCELED_BY_USER && "ring-2 ring-red-400"
                      )}>
                        {registration.user.avatar ? (
                          <img
                            src={registration.user.avatar}
                            alt={fullName}
                            className={cn(
                              "w-full h-full object-cover",
                              registration.status === RegistrationStatus.CANCELED_BY_USER && "filter grayscale"
                            )}
                          />
                        ) : (
                          <div className={cn(
                            "w-full h-full flex items-center justify-center",
                            registration.status === RegistrationStatus.CANCELED_BY_USER
                              ? "text-red-500 bg-red-100"
                              : "text-gray-500"
                          )}>
                            {registration.user.first_name.charAt(0)}
                            {registration.user.second_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "leading-tight",
                        registration.status === RegistrationStatus.CANCELED_BY_USER && "text-red-500"
                      )}>
                        <div className="font-medium text-base">{registration.user.first_name} {registration.user.second_name}</div>
                        <div className="text-sm text-gray-600">{getRatingWord(registration.user.rank)}</div>
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
