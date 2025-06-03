import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  deleteRegistration,
  getTournament,
  getTournamentRegistration,
  getTournamentWaitlistStatus,
} from "@/api/api"
import { Tournament } from "@/types/tournament"
import { Waitlist } from "@/types/waitlist"
import Header from "@/components/Header"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaStar,
  FaUsers,
  FaTelegramPlane,
  FaInfoCircle,
} from "react-icons/fa"
import TournamentParticipants from "@/components/TournamentParticipants"
import ParticipateButton from "@/components/ParticipateButton"
import WaitlistButton from "@/components/WaitlistButton"
import Divider from "@/components/ui/Divider"
import { Spinner } from "@/components/ui/Spinner"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import useUserStore from "@/stores/userStore"
import { formatTournamentDateTime } from "@/utils/formatDate"
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
  const [waitlistEntry, setWaitlistEntry] = useState<Waitlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
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
        
        // Check waitlist status only if not registered
        if (!registrationData || registrationData.status === RegistrationStatus.CANCELED_BY_USER) {
          const waitlistData = await getTournamentWaitlistStatus(id)
          setWaitlistEntry(waitlistData)
        } else {
          setWaitlistEntry(null)
        }
      } else {
        // If no user data, reset registration and waitlist state
        setRegistration(null)
        setWaitlistEntry(null)
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

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = async () => {
    if (!id) return
    setCancelLoading(true)
    try {
      const response = await deleteRegistration(id)
      if (response) {
        fetchTournament()
        setShowCancelDialog(false)
      }
    } catch (error) {
      console.error("Error canceling registration:", error)
    } finally {
      setCancelLoading(false)
    }
  }

  const handleCancelDialogClose = () => {
    if (!cancelLoading) {
      setShowCancelDialog(false)
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

  const formattedDateTime = formatTournamentDateTime(
    tournament.start_time,
    tournament.end_time || undefined
  )

  // Check if user meets rank requirements
  const hasValidRank =
    userData &&
    userData.rank >= tournament.rank_min &&
    userData.rank <= tournament.rank_max

  // Check if tournament has available spots
  const hasAvailableSpots = tournament.current_users < tournament.max_users

  // Check if tournament is finished
  const isFinished = tournament.is_finished

  return (
    <div className="p-4 bg-white min-h-screen flex flex-col pb-20">
      <Header />

      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{tournament.name}</h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-6 mr-2">
              <FaCalendarAlt className="text-gray-600" />
            </div>
            {formattedDateTime}
          </div>

          <div className="flex items-center">
            <div className="w-6 mr-2">
              <FaMapMarkerAlt className="text-gray-600" />
            </div>
            <div className="text-sm">
              <span className="font-medium">{tournament.club.name}</span> <br />
              <span className="text-gray-500 text-xs">{tournament.club.address}</span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-6 mr-2">
              <FaTelegramPlane className="text-gray-600" />
            </div>
            <span>Тип: {tournament.tournament_type}</span>
          </div>

          <div className="flex items-center">
            <div className="w-6 mr-2">
              <FaStar className="text-gray-600" />
            </div>
            <span>
              {getRatingRangeDescription(tournament.rank_min, tournament.rank_max)}
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

        {tournament.description && (
          <>
            <div className="my-4">
              <Divider />
            </div>
            
            <div className="mb-4">
              <div className="flex items-start">
                <div className="w-6 mr-2 mt-0.5">
                  <FaInfoCircle className="text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Описание турнира</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {tournament.description}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {tournament.organizator.username && (
            <button
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors duration-200 border border-blue-200"
              onClick={() => openTelegramLink(`https://t.me/${tournament.organizator.username}`)}
            >
              <FaTelegramPlane size={16} />
              <span className="text-sm font-medium">Написать организатору</span>
            </button>
          )}

        <div className="my-4">
          <Divider />
        </div>

        <TournamentParticipants
          tournamentId={tournament.id}
          registrations={tournament.registrations || []}
        />

        <div className="mt-auto">
          {isFinished ? (
            <div className="mt-4 text-center">
              <p className="mb-2 text-gray-600">Турнир завершен</p>
              {registration?.status === RegistrationStatus.ACTIVE && (
                <p className="text-sm text-gray-500">Вы участвовали в этом турнире</p>
              )}
            </div>
          ) : registration?.status === RegistrationStatus.CANCELED_BY_USER ? (
            <div className="mt-4 text-center">
              <p className="mb-2 text-gray-600">Ваша регистрация была отменена</p>
              {hasAvailableSpots ? (
                <ParticipateButton
                  tournamentId={tournament.id}
                  registration={null}
                  isReturning={true}
                  callback={() => {
                    fetchTournament()
                  }}
                />
              ) : (
                <p className="mb-2 text-amber-600">
                  Нет свободных мест для возврата в турнир
                </p>
              )}
              {!hasAvailableSpots && (
                <div className="mt-2">
                  <WaitlistButton
                    tournamentId={tournament.id}
                    waitlistEntry={waitlistEntry}
                    callback={() => {
                      fetchTournament()
                    }}
                  />
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Для возврата обращайтесь к{" "}
                <span
                  className="font-bold text-blue-500"
                  onClick={() => openTelegramLink("https://t.me/@Alievskey")}
                >
                  @Alievskey
                </span>
              </p>
            </div>
          ) : registration?.status === RegistrationStatus.ACTIVE ? (
            <div className="mt-4 text-center">
              <p className={`mb-2 text-green-600`}>Вы зарегистрированы</p>
              <GreenButton
                onClick={handleCancelClick}
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
          ) : waitlistEntry && hasAvailableSpots ? (
            <div className="mt-4 text-center">
              <p className="text-green-600 mb-2">
                Освободилось место! Теперь вы можете зарегистрироваться
              </p>
              <ParticipateButton
                tournamentId={tournament.id}
                registration={registration}
                callback={() => {
                  fetchTournament()
                }}
              />
            </div>
          ) : !hasAvailableSpots && !registration ? (
            <div className="mt-4 text-center">
              {waitlistEntry ? (
                <>
                  <p className="text-blue-600 mb-2">
                    Вы записаны в лист ожидания
                  </p>
                  <WaitlistButton
                    tournamentId={tournament.id}
                    waitlistEntry={waitlistEntry}
                    callback={() => {
                      fetchTournament()
                    }}
                  />
                </>
              ) : (
                <>
                  <p className="text-amber-600 mb-2">
                    Мест нет, но вы можете записаться в лист ожидания
                  </p>
                  <WaitlistButton
                    tournamentId={tournament.id}
                    waitlistEntry={waitlistEntry}
                    callback={() => {
                      fetchTournament()
                    }}
                  />
                </>
              )}
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

      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Отменить участие"
        message="Вы точно уверены, что хотите отменить участие в турнире?"
        confirmText="Да, отменить"
        cancelText="Нет"
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelDialogClose}
        isLoading={cancelLoading}
      />
    </div>
  )
}
