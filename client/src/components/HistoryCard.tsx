import { RegistrationWithTournament, RegistrationStatus } from "@/types/registration"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa"
import { formatTournamentDateTime } from "@/utils/formatDate"

interface HistoryCardProps {
  registration: RegistrationWithTournament
}

export default function HistoryCard({ registration }: HistoryCardProps) {
  const tournament = registration.tournament
  const isFinished = tournament.is_finished

  const formattedDateTime = formatTournamentDateTime(
    tournament.start_time,
    tournament.end_time || undefined
  )

  return (
    <div className={`rounded-lg border p-4 mb-3 ${
      isFinished ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold text-lg ${isFinished ? 'text-gray-600' : 'text-gray-900'}`}>
          {tournament.name}
        </h3>
        {isFinished && (
          <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <FaCheckCircle className="mr-1" />
            Завершен
          </div>
        )}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <FaCalendarAlt className={`mr-2 ${isFinished ? 'text-gray-400' : 'text-gray-600'}`} />
          <span className={isFinished ? 'text-gray-500' : 'text-gray-600'}>{formattedDateTime}</span>
        </div>
        
        <div className="flex items-center">
          <FaMapMarkerAlt className={`mr-2 ${isFinished ? 'text-gray-400' : 'text-gray-600'}`} />
          <div className="text-sm">
            <span className={`font-medium ${isFinished ? 'text-gray-500' : 'text-gray-700'}`}>
              {tournament.club.name}
            </span> <br />
            <span className={`text-xs ${isFinished ? 'text-gray-400' : 'text-gray-500'}`}>
              {tournament.club.address}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isFinished ? 'text-gray-400' : 'text-gray-500'}`}>Статус:</span>
          <span className={`text-sm font-medium ${
            registration.status === RegistrationStatus.ACTIVE ? 
              (isFinished ? 'text-gray-600' : 'text-green-600') : 
            registration.status === RegistrationStatus.PENDING ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {registration.status === RegistrationStatus.ACTIVE ? 
              (isFinished ? 'Участвовал' : 'Активная') :
             registration.status === RegistrationStatus.PENDING ? 'В ожидании' :
             'Отменена'}
          </span>
        </div>
      </div>
    </div>
  )
}
