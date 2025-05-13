import React, { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { IoIosArrowForward } from "react-icons/io"
import { Participant } from "@/types/tournament"
import "./TournamentParticipants.css"
import { Spinner } from "./ui/Spinner"

type TournamentParticipantsProps = {
  tournamentId: string
  participants?: Participant[]
  showAll?: boolean
  maxDisplay?: number
}

export default function TournamentParticipants({
  tournamentId,
  participants = [],
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
  }, [participants])

  const displayParticipants = showAll
    ? participants
    : participants.slice(0, maxDisplay)

  return (
    <div>
      <Link to={`/tournament/${tournamentId}/participants`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Участники</h2>
          <IoIosArrowForward size={24} />
        </div>
      </Link>

      <div className="relative mb-8">
        {showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
        )}

        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide px-1"
        >
          <div className="flex space-x-4 min-w-max py-2 scroll-smooth">
            {displayParticipants.length > 0 ? (
              displayParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 overflow-hidden">
                    {participant.avatar && (
                      <img
                        src={participant.avatar}
                        alt={`${participant.first_name} ${participant.second_name}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-center text-xs">
                    {participant.second_name}
                    <br />
                    dsf
                    {participant.first_name}
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
