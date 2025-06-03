import { getUserTournamentHistory } from "@/api/api"
import HistoryCard from "@/components/HistoryCard"
import Header from "@/components/Header"
import { Spinner } from "@/components/ui/Spinner"
import useUserStore from "@/stores/userStore"
import { RegistrationWithTournament } from "@/types/registration"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function HistoryPage() {
  const { userData } = useUserStore()
  const [registrations, setRegistrations] = useState<
    RegistrationWithTournament[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userData) {
      setLoading(true)
      getUserTournamentHistory()
        .then((registrations) => {
          if (registrations) {
            // Сортируем турниры: сначала активные, потом завершенные
            // Внутри каждой группы сортируем по дате турнира
            const sortedRegistrations = [...registrations].sort((a, b) => {
              const aFinished = a.tournament.is_finished
              const bFinished = b.tournament.is_finished
              
              // Сначала активные турниры (незавершенные)
              if (aFinished !== bFinished) {
                return aFinished ? 1 : -1
              }
              
              // Внутри каждой группы сортируем по дате начала турнира
              // Для активных турниров - по возрастанию (ближайшие первыми)
              // Для завершенных турниров - по убыванию (недавние первыми)
              const aDate = new Date(a.tournament.start_time).getTime()
              const bDate = new Date(b.tournament.start_time).getTime()
              
              if (aFinished) {
                // Завершенные турниры: новые первыми
                return bDate - aDate
              } else {
                // Активные турниры: ближайшие первыми
                return aDate - bDate
              }
            })
            
            setRegistrations(sortedRegistrations)
          } else {
            setRegistrations([])
          }
        })
        .catch((error) => {
          console.error("Error fetching tournaments:", error)
          setRegistrations([])
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [userData])

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen pb-20">
        <Header />
        <h1 className="text-2xl font-bold text-center mt-4">История участия</h1>
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white min-h-screen pb-20">
      <Header />
      <h1 className="text-2xl font-bold text-center mt-4">История участия</h1>
      
      <div className="mt-4">
        {registrations.length > 0 ? (
          <>
            {(() => {
              // Разделяем регистрации на активные и завершенные
              const activeRegistrations = registrations.filter(r => !r.tournament.is_finished)
              const finishedRegistrations = registrations.filter(r => r.tournament.is_finished)
              
              return (
                <>
                  {/* Активные турниры */}
                  {activeRegistrations.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 px-1">
                        Активные турниры ({activeRegistrations.length})
                      </h2>
                      {activeRegistrations.map((registration) => (
                        <Link
                          key={registration.id}
                          to={`/tournament/${registration.tournament.id}`}
                        >
                          <HistoryCard registration={registration} />
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Завершенные турниры */}
                  {finishedRegistrations.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 px-1">
                        Завершенные турниры ({finishedRegistrations.length})
                      </h2>
                      {finishedRegistrations.map((registration) => (
                        <Link
                          key={registration.id}
                          to={`/tournament/${registration.tournament.id}`}
                        >
                          <HistoryCard registration={registration} />
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              История пуста
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
              Здесь будут отображаться турниры, в которых вы участвовали.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
