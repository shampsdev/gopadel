import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getTournament } from "@/api/api"
import { Tournament } from "@/types/tournament"
import Header from "@/components/Header"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaStar,
  FaUsers,
  FaClock,
} from "react-icons/fa"
import { IoIosArrowBack } from "react-icons/io"
import TournamentParticipants from "@/components/TournamentParticipants"
import ParticipateButton from "@/components/ParticipateButton"
import Divider from "@/components/ui/Divider"
import { Spinner } from "@/components/ui/Spinner"
import useUserStore from "@/stores/userStore"
import { formatPrice } from "@/utils/formatPrice"

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [isParticipating, setIsParticipating] = useState(false)
  const [waitlistStatus, setWaitlistStatus] = useState<
    "none" | "available" | "inWaitlist"
  >("none")
  const { userData } = useUserStore()

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await getTournament(id)
        if (!data) return

        setTournament(data)

        // Check if user is already participating
        const isUserParticipating =
          data.registrations?.some(
            (registration) => registration.user.id === userData?.id
          ) || false

        setIsParticipating(isUserParticipating)

        // TODO: Implement waitlist status check
        setWaitlistStatus("none")
      } catch (error) {
        console.error("Error fetching tournament:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTournament()
  }, [id, userData?.id])

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen">
        <Header />
        <div className="text-center py-4">
          <Spinner size="lg" />
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

  const formattedDate = format(new Date(tournament.start_time), "dd MMMM", {
    locale: ru,
  })

  const formattedTime = format(new Date(tournament.start_time), "HH:mm", {
    locale: ru,
  })

  // Check if user meets rank requirements
  const hasValidRank =
    userData &&
    userData.rank >= tournament.rank_min &&
    userData.rank <= tournament.rank_max

  // Check if tournament has available spots
  const hasAvailableSpots = tournament.current_users < tournament.max_users

  return (
    <div className="p-4 bg-white min-h-screen flex flex-col">
      <Header />

      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{tournament.name}</h1>
          <p className="text-gray-700">{tournament.organizer}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-6 mr-2">
              <FaCalendarAlt className="text-gray-600" />
            </div>
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center">
            <div className="w-6 mr-2">
              <FaClock className="text-gray-600" />
            </div>
            <span>{formattedTime}</span>
          </div>

          <div className="flex items-center">
            <div className="w-6 mr-2">
              <FaMapMarkerAlt className="text-gray-600" />
            </div>
            <span>{tournament.location}</span>
          </div>

          <div className="flex items-center">
            <div className="w-6 mr-2">
              <FaStar className="text-gray-600" />
            </div>
            <span>
              ранг от {tournament.rank_min} до {tournament.rank_max}
            </span>
          </div>

          <div className="flex items-center">
            <div className="w-6 mr-2">
              <FaUsers className="text-gray-600" />
            </div>
            <span>
              {tournament.current_users}/{tournament.max_users}
            </span>
          </div>
          <div className="font-semibold">
            <span>{formatPrice(tournament.price)}</span>
          </div>
        </div>

        <div className="my-4">
          <Divider />
        </div>

        <TournamentParticipants
          tournamentId={tournament.id}
          registrations={tournament.registrations || []}
        />

        <div className="mt-auto">
          {isParticipating ? (
            <ParticipateButton
              tournamentId={tournament.id}
              isParticipating={true}
            />
          ) : !hasValidRank ? (
            <div className="mt-4 text-center">
              <p className="opacity-50 mb-2">
                Ваш ранг не соответствует требованиям турнира
              </p>
            </div>
          ) : !hasAvailableSpots ? (
            waitlistStatus === "inWaitlist" ? (
              <div className="mt-4 text-center">
                <p className="text-amber-600 mb-2">Вы в листе ожидания</p>
                <ParticipateButton
                  tournamentId={tournament.id}
                  isParticipating={true}
                />
              </div>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-amber-600 mb-2">
                  Мест нет, но вы можете записаться в лист ожидания
                </p>
                <ParticipateButton
                  tournamentId={tournament.id}
                  isParticipating={false}
                  isWaitlist={true}
                />
              </div>
            )
          ) : (
            <ParticipateButton
              tournamentId={tournament.id}
              isParticipating={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
