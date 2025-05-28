import React from "react"
import { Tournament } from "@/types/tournament"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaStar,
  FaUsers,
  FaTelegramPlane,
} from "react-icons/fa"
import { formatMoscowTime } from "@/utils/formatDate"
import PriceWithDiscount from "./PriceWithDiscount"
import useUserStore from "@/stores/userStore"
import { getRatingRangeDescription } from "@/utils/ratingUtils"
import { openTelegramLink } from "@telegram-apps/sdk-react"

type TournamentCardProps = {
  tournament: Tournament
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const { userData } = useUserStore()

  const formattedDate = formatMoscowTime(tournament.start_time)

  return (
    <div className="w-full rounded-3xl border-2 border-gray-300 p-5 mb-3">
      <h3 className="font-semibold text-xl mb-1">{tournament.name}</h3>
      <div className="text-gray-700 mb-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-medium">Организатор</span>
          <span>
            {tournament.organizator.first_name}
          </span>
        </div>
        
        {tournament.organizator.username && (
          <button
            className="flex items-center text-blue-500 gap-1 hover:text-blue-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              openTelegramLink(`https://t.me/${tournament.organizator.username}`);
            }}
          >
            <FaTelegramPlane size={24} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-6 mr-2">
            <FaCalendarAlt className="text-gray-600" />
          </div>
          <span className="text-sm">{formattedDate}</span>
        </div>

        <div className="flex items-center">
          <div className="w-6 mr-2">
            <FaMapMarkerAlt className="text-gray-600" />
          </div>
          <span className="text-sm">{tournament.location}</span>
        </div>

        <div className="flex items-center">
          <div className="w-6 mr-2">
            <FaStar className="text-gray-600" />
          </div>
          <span className="text-sm">
            Рейтинг: {getRatingRangeDescription(tournament.rank_min, tournament.rank_max)}
          </span>
        </div>
      </div>

      <div className="flex justify-between mt-4 pt-2 border-t border-gray-200">
        <div className="flex items-center">
          <span className="font-semibold">
            <PriceWithDiscount
              price={tournament.price}
              discount={userData?.loyalty?.discount ?? 0}
            />
          </span>
        </div>

        <div className="flex items-center">
          <div className="w-6 mr-1">
            <FaUsers className="text-gray-600" />
          </div>
          <span className="font-semibold">
            {tournament.current_users}/{tournament.max_users}
          </span>
        </div>
      </div>
    </div>
  )
}
