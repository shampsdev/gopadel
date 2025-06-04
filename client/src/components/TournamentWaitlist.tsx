import React from "react"
import { Link } from "react-router-dom"
import { IoIosArrowForward } from "react-icons/io"
import { FaClock } from "react-icons/fa"

type TournamentWaitlistProps = {
  tournamentId: string
  waitlistCount: number
}

export default function TournamentWaitlist({
  tournamentId,
  waitlistCount,
}: TournamentWaitlistProps) {
  return (
    <div className="mt-4">
      <Link to={`/tournament/${tournamentId}/waitlist`}>
        <div className="flex justify-between items-center p-3 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <FaClock className="text-amber-600" size={14} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-800">Список ожидания</h3>
              <p className="text-xs text-amber-600">
                {waitlistCount === 0 
                  ? "Пока никого нет" 
                  : `${waitlistCount} ${waitlistCount === 1 ? 'человек' : waitlistCount < 5 ? 'человека' : 'человек'}`
                }
              </p>
            </div>
          </div>
          <IoIosArrowForward size={20} className="text-amber-600" />
        </div>
      </Link>
    </div>
  )
} 