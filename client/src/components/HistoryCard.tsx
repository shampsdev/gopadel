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
import { RegistrationWithTournament } from "@/types/registration"

export default function TournamentCard({
  registration,
}: {
  registration: RegistrationWithTournament
}) {
  const { userData } = useUserStore()

  const formattedDate = formatMoscowTime(registration.tournament.start_time)

  return (
    <div className="w-full rounded-3xl border-2 border-gray-300 p-5 mb-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-xl mb-1">
          {registration.tournament.name}
        </h3>
        {registration.tournament.is_finished && (
          <span className="text-sm opacity-50">Завершен</span>
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
          <span className="text-sm">{registration.tournament.location}</span>
        </div>
      </div>
    </div>
  )
}
