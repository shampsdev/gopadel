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

  return (
    <div className="w-full rounded-3xl border-2 border-gray-300 p-5 mb-3">
      <h3 className="font-semibold text-xl mb-1">{tournament.name}</h3>
      <div className="text-gray-700 mb-4">
        <span className="font-medium">Организатор: </span>
        <span>{tournament.organizator.first_name}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-6 mr-2">
            <FaCalendarAlt className="text-gray-600" />
          </div>
          <span className="text-sm">
            {formattedDateTime}
          </span>
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
            <FaTrophy className="text-gray-600" />
          </div>
          <span className="text-sm">Тип: {tournament.tournament_type}</span>
        </div>

        <div className="flex items-center">
          <div className="w-6 mr-2">
            <FaStar className="text-gray-600" />
          </div>
          <span className="text-sm">
            {getRatingRangeDescription(tournament.rank_min, tournament.rank_max)}
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
