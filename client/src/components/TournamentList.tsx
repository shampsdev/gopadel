import React, { useState, useEffect } from "react"
import { Tournament } from "@/types/tournament"
import TournamentCard from "./TournamentCard"
import { getTournaments } from "@/api/api"
import { Link } from "react-router-dom"
import { Spinner } from "./ui/Spinner"

interface TournamentListProps {
  showAvailableFilter?: boolean
  availableOnly?: boolean
}

export default function TournamentList({ showAvailableFilter = true, availableOnly = false }: TournamentListProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [availableOnlyState, setAvailableOnlyState] = useState(availableOnly)
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>(
    []
  )

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true)
      try {
        const shouldFilter = showAvailableFilter ? availableOnlyState : availableOnly
        const data = await getTournaments(shouldFilter)
        setTournaments(data)
        setFilteredTournaments(data)
      } catch (error) {
        console.error("Error fetching tournaments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [availableOnlyState, showAvailableFilter, availableOnly])

  useEffect(() => {
    // If showAvailableFilter is false and availableOnly is true, always show filtered
    // If showAvailableFilter is true, use the state value
    const shouldShowFiltered = showAvailableFilter ? availableOnlyState : availableOnly
    
    if (!shouldShowFiltered) {
      setFilteredTournaments(tournaments)
    } else {
      const filtered = tournaments.filter(
        (tournament) => tournament.current_users < tournament.max_users
      )
      setFilteredTournaments(filtered)
    }
  }, [availableOnlyState, tournaments, showAvailableFilter, availableOnly])

  // Update state when prop changes
  useEffect(() => {
    setAvailableOnlyState(availableOnly)
  }, [availableOnly])

  return (
    <div className="w-full max-w-md mx-auto">
      {showAvailableFilter && (
        <div className="mb-5 flex items-center justify-between">
          <span className="text-gray-700 font-medium">Доступные мне</span>
          <div
            className="relative inline-block w-12 h-6 cursor-pointer"
            onClick={() => setAvailableOnlyState(!availableOnlyState)}
          >
            <div
              className={`w-full h-full rounded-full transition-colors duration-200 ease-in-out ${
                availableOnlyState ? "bg-green" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                availableOnlyState ? "translate-x-6" : ""
              }`}
            ></div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <Spinner className="mx-auto text-green-500" />
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="text-center py-4">Нет доступных турниров</div>
      ) : (
        filteredTournaments.map((tournament) => (
          <Link key={tournament.id} to={`/tournament/${tournament.id}`}>
            <TournamentCard tournament={tournament} />
          </Link>
        ))
      )}
    </div>
  )
}
