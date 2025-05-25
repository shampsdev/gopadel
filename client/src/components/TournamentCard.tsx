import React from "react"
import { Tournament } from "@/types/tournament"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaStar,
  FaRubleSign,
  FaUsers,
} from "react-icons/fa"
import { formatMoscowTime } from "@/utils/formatDate"
import { formatPrice } from "@/utils/formatPrice"
import PriceWithDiscount from "./PriceWithDiscount"
import useAuth from "@/hooks/useAuth"
import useUserStore from "@/stores/userStore"
type TournamentCardProps = {
  tournament: Tournament
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const { userData } = useUserStore()

  const formattedDate = formatMoscowTime(tournament.start_time)

  return (
    <div className="w-full rounded-3xl border-2 border-gray-300 p-5 mb-3">
      <h3 className="font-semibold text-xl mb-1">{tournament.name}</h3>
      <div className="text-gray-700 mb-4 flex justify-between gap-4">
        <span className="font-medium">Организатор</span>

        <span>
          {tournament.organizator.first_name}{" "}
          {tournament.organizator.second_name}
        </span>
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
            ранг от {tournament.rank_min} до {tournament.rank_max}
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
