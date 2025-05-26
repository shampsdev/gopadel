import React, { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { IoIosArrowForward } from "react-icons/io"
import { Registration } from "@/types/registration"
import "./TournamentParticipants.css"
import { Spinner } from "./ui/Spinner"

type TournamentParticipantsProps = {
  tournamentId: string
  registrations?: Registration[]
  showAll?: boolean
  maxDisplay?: number
}

export default function TournamentParticipants({
  tournamentId,
  registrations = [],
  showAll = false,
  maxDisplay = 4,
}: TournamentParticipantsProps) {
  const [showLeftShadow, setShowLeftShadow] = useState(false)
  const [showRightShadow, setShowRightShadow] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current
      if (!container) return

      setShowLeftShadow(container.scrollLeft > 0)
      setShowRightShadow(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10
      )
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScroll)
      // Initial check
      checkScroll()

      return () => container.removeEventListener("scroll", checkScroll)
    }
  }, [registrations])

  const displayRegistrations = showAll
    ? registrations
    : registrations.slice(0, maxDisplay)

  return (
    <div>
      <Link to={`/tournament/${tournamentId}/participants`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Участники</h2>
          <IoIosArrowForward size={24} />
        </div>
      </Link>

      <div className="relative">
        {showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
        )}

        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide px-1"
        >
          <div className="flex space-x-4 min-w-max py-2 scroll-smooth">
            {displayRegistrations.length > 0 ? (
              displayRegistrations.map((registration) => (
                <div
                  key={registration.user?.id}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden mb-1 bg-gray-200">
                    {registration.user?.avatar ? (
                      <img
                        src={registration.user.avatar}
                        alt={registration.user.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        {registration.user.first_name.charAt(0)}
                        {registration.user.second_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-center text-xs">
                    {registration.user?.second_name}
                    <br />
                    {registration.user?.first_name}
                  </p>
                </div>
              ))
            ) : (
              <span className="text-center text-sm opacity-50">
                На этот турнир пока никто не зарегистрировался
              </span>
            )}
          </div>
        </div>

        {showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />
        )}
      </div>
    </div>
  )
}
