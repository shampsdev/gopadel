import React from "react"
import { Tournament } from "@/types/tournament"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaStar,
  FaUsers,
  FaTrophy,
} from "react-icons/fa"
import PriceWithDiscount from "./PriceWithDiscount"
import useUserStore from "@/stores/userStore"
import { getRatingRangeDescription } from "@/utils/ratingUtils"
import { formatTournamentDateTime } from "@/utils/formatDate"

type TournamentCardProps = {
  tournament: Tournament
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const { userData } = useUserStore()

  const formattedDateTime = formatTournamentDateTime(
    tournament.start_time,
    tournament.end_time || undefined
  )

  // Проверяем, заполнен ли турнир
  const isFull = tournament.current_users >= tournament.max_users

  return (
    <div className={`w-full rounded-3xl border-2 p-5 mb-3 relative transition-all duration-200 ${
      isFull 
        ? 'border-gray-200 bg-gray-50' // Заполненные турниры
        : 'border-gray-300 bg-white hover:shadow-md' // Доступные турниры
    }`}>
      {/* Индикатор заполненности */}
      {isFull && (
        <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
          Места кончились
        </div>
      )}
      
      <h3 className={`font-semibold text-xl mb-1 pr-20 ${isFull ? 'text-gray-600' : 'text-gray-900'}`}>{tournament.name}</h3>
      <div className={`mb-4 ${isFull ? 'text-gray-500' : 'text-gray-700'}`}>
        <span className="font-medium">Организатор: </span>
        <span>{tournament.organizator.first_name}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-6 mr-2">
            <FaCalendarAlt className={`${isFull ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <span className={`text-sm ${isFull ? 'text-gray-500' : 'text-gray-700'}`}>
            {formattedDateTime}
          </span>
        </div>

        <div className="flex items-center">
          <div className="w-6 mr-2">
            <FaMapMarkerAlt className={`${isFull ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <div className={`text-sm ${isFull ? 'text-gray-500' : 'text-gray-700'}`}>
            <span className="font-medium">{tournament.club.name}</span> <br />
            <span className={`text-xs ${isFull ? 'text-gray-400' : 'text-gray-500'}`}>{tournament.club.address}</span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-6 mr-2">
            <FaTrophy className={`${isFull ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <span className={`text-sm ${isFull ? 'text-gray-500' : 'text-gray-700'}`}>Тип: {tournament.tournament_type}</span>
        </div>

        <div className="flex items-center">
          <div className="w-6 mr-2">
            <FaStar className={`${isFull ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <span className={`text-sm ${isFull ? 'text-gray-500' : 'text-gray-700'}`}>
            {getRatingRangeDescription(tournament.rank_min, tournament.rank_max)}
          </span>
        </div>
      </div>

      <div className={`flex justify-between mt-4 pt-2 border-t ${isFull ? 'border-gray-200' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <span className={`font-semibold ${isFull ? 'text-gray-500' : 'text-gray-900'}`}>
            <PriceWithDiscount
              price={tournament.price}
              discount={userData?.loyalty?.discount ?? 0}
            />
          </span>
        </div>

        <div className="flex items-center">
          <div className="w-6 mr-1">
            <FaUsers className={`${isFull ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <span className={`font-semibold ${isFull ? 'text-amber-600' : 'text-gray-900'}`}>
            {tournament.current_users}/{tournament.max_users}
          </span>
        </div>
      </div>
    </div>
  )
}
