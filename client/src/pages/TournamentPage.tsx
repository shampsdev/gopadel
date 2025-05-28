import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  deleteRegistration,
  getTournament,
  getTournamentRegistration,
} from "@/api/api"
import { Tournament } from "@/types/tournament"
import Header from "@/components/Header"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaStar,
  FaUsers,
  FaClock,
} from "react-icons/fa"
import TournamentParticipants from "@/components/TournamentParticipants"
import ParticipateButton from "@/components/ParticipateButton"
import Divider from "@/components/ui/Divider"
import { Spinner } from "@/components/ui/Spinner"
import useUserStore from "@/stores/userStore"
import { formatDateAndTime } from "@/utils/formatDate"
import { Registration } from "@/types/registration"
import { RegistrationStatus } from "@/types/registration"
import GreenButton from "@/components/ui/GreenButton"
import PriceWithDiscount from "@/components/PriceWithDiscount"
import { openTelegramLink } from "@telegram-apps/sdk-react"
import { getRatingRangeDescription } from "@/utils/ratingUtils"

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const { userData } = useUserStore()

  const fetchTournament = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getTournament(id)
      if (!data) return

      setTournament(data)

      if (userData?.id) {
        const registrationData = await getTournamentRegistration(id)
        setRegistration(registrationData)
      } else {
        // If no user data, reset registration state
        setRegistration(null)
      }
    } catch (error) {
      console.error("Error fetching tournament:", error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchTournament()
  }, [id, userData?.id])

  const handleDeleteRegistration = async () => {
    if (!id) return
    const response = await deleteRegistration(id)
    if (response) {
      fetchTournament()
    }
  }

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

  const { date: formattedDate, time: formattedTime } = formatDateAndTime(
    tournament.start_time
  )

  // Check if user meets rank requirements
  const hasValidRank =
    userData &&
    userData.rank >= tournament.rank_min &&
    userData.rank <= tournament.rank_max

  // Check if tournament has available spots
  const hasAvailableSpots = tournament.current_users < tournament.max_users

  return (
    <div className="p-4 bg-white min-h-screen flex flex-col pb-20">
      <Header />

      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{tournament.name}</h1>
          <p className="text-gray-700">
            Организатор: {tournament.organizator.first_name}
          </p>
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
              Рейтинг: {getRatingRangeDescription(tournament.rank_min, tournament.rank_max)}
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
            <PriceWithDiscount
              price={tournament.price}
              discount={userData?.loyalty?.discount ?? 0}
            />
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
          {registration?.status === RegistrationStatus.CANCELED_BY_USER ? (
            <div className="mt-4 text-center">
              Ваша регистрация отменена. По поводу возврата денег обращайтесь к{" "}
              <span
                className="font-bold text-blue-500"
                onClick={() => openTelegramLink("https://t.me/@Alievskey")}
              >
                @Alievskey
              </span>
            </div>
          ) : registration?.status === RegistrationStatus.ACTIVE ? (
            <div className="mt-4 text-center">
              <p className={`mb-2 text-green-600`}>Вы зарегистрированы</p>
              <GreenButton
                onClick={handleDeleteRegistration}
                buttonClassName="bg-red-500"
                className="w-full"
              >
                Отменить регистрацию
              </GreenButton>
            </div>
          ) : !hasValidRank ? (
            <div className="mt-4 text-center">
              <p className="opacity-50 mb-2">
                Ваш рейтинг не соответствует требованиям турнира
              </p>
            </div>
          ) : !hasAvailableSpots && !registration ? (
            <div className="mt-4 text-center">
              <p className="text-amber-600 mb-2">
                Мест нет, но вы можете записаться в лист ожидания
              </p>
              <GreenButton onClick={() => {}}>
                Записаться в лист ожидания
              </GreenButton>
            </div>
          ) : (
            <ParticipateButton
              tournamentId={tournament.id}
              registration={registration}
              callback={() => {
                fetchTournament()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
