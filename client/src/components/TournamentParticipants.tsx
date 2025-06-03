import React, { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { IoIosArrowForward } from "react-icons/io"
import { Registration, RegistrationStatus } from "@/types/registration"
import "./TournamentParticipants.css"
import { cn } from "@/lib/utils"

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
  maxDisplay = 10,
}: TournamentParticipantsProps) {
  const [showLeftShadow, setShowLeftShadow] = useState(false)
  const [showRightShadow, setShowRightShadow] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Function to navigate to user profile
  const goToUserProfile = (userId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    navigate(`/people/${userId}`)
  }

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
              displayRegistrations.map((registration) => {
                // Combine first and last name
                const fullName = `${registration.user.first_name} ${registration.user.second_name}`
                return (
                  <div
                    key={registration.user?.id}
                    className={cn(
                      "flex flex-col items-center cursor-pointer",
                      registration.status === RegistrationStatus.PENDING && "opacity-50",
                      registration.status === RegistrationStatus.CANCELED_BY_USER && "opacity-75"
                    )}
                    onClick={(e) => goToUserProfile(registration.user.id, e)}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-full overflow-hidden mb-1 bg-gray-200 flex-shrink-0",
                      registration.status === RegistrationStatus.CANCELED_BY_USER && "ring-2 ring-red-400"
                    )}>
                      {registration.user?.avatar ? (
                        <img
                          src={registration.user.avatar}
                          alt={fullName}
                          className={cn(
                            "w-full h-full object-cover",
                            registration.status === RegistrationStatus.CANCELED_BY_USER && "filter grayscale"
                          )}
                        />
                      ) : (
                        <div className={cn(
                          "w-full h-full flex items-center justify-center",
                          registration.status === RegistrationStatus.CANCELED_BY_USER 
                            ? "text-red-500 bg-red-100" 
                            : "text-gray-500"
                        )}>
                          {registration.user.first_name.charAt(0)}
                          {registration.user.second_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className={cn(
                      "text-center text-xs leading-tight",
                      registration.status === RegistrationStatus.CANCELED_BY_USER && "text-red-500"
                    )}>
                      <div className="font-medium">{registration.user.first_name}</div>
                      <div>{registration.user.second_name}</div>
                    </p>
                  </div>
                )
              })
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
