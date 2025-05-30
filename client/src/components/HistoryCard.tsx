import { RegistrationWithTournament, RegistrationStatus } from "@/types/registration"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa"
import { formatDateAndTime } from "@/utils/formatDate"

interface HistoryCardProps {
  registration: RegistrationWithTournament
}

export default function HistoryCard({ registration }: HistoryCardProps) {
  const tournament = registration.tournament

  const { date, time } = formatDateAndTime(tournament.start_time)

  return (
    <div className="bg-white rounded-lg border p-4 mb-3">
      <h3 className="font-semibold text-lg mb-2">{tournament.name}</h3>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <FaCalendarAlt className="mr-2" />
          <span>{date} в {time}</span>
        </div>
        
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-2" />
          <span>{tournament.location}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Статус:</span>
          <span className={`text-sm font-medium ${
            registration.status === RegistrationStatus.ACTIVE ? 'text-green-600' : 
            registration.status === RegistrationStatus.PENDING ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {registration.status === RegistrationStatus.ACTIVE ? 'Активная' :
             registration.status === RegistrationStatus.PENDING ? 'В ожидании' :
             'Отменена'}
          </span>
        </div>
      </div>
    </div>
  )
}
