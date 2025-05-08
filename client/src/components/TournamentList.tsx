import React, { useState, useEffect } from "react"
import { Tournament } from "@/types/tournament"
import TournamentCard from "./TournamentCard"
import { getTournaments } from "@/api/api"

export default function TournamentList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>(
    []
  )

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true)
      try {
        const data = await getTournaments()
        setTournaments(data)
        setFilteredTournaments(data)
      } catch (error) {
        console.error("Error fetching tournaments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  useEffect(() => {
    if (!availableOnly) {
      setFilteredTournaments(tournaments)
    } else {
      const filtered = tournaments.filter(
        (tournament) => tournament.current_users < tournament.max_users
      )
      setFilteredTournaments(filtered)
    }
  }, [availableOnly, tournaments])

  // Example of how to mark unused variables with an underscore
  // This is just an example for demonstration - not for actual implementation
  const exampleFunction = (_unusedParam: string) => {
    const _unusedVariable = "This won't trigger a warning"

    // Variables that you actually use don't need the underscore
    const usedVariable = "This is used"
    console.log(usedVariable)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-gray-700 font-medium">Доступные мне</span>
        <div
          className="relative inline-block w-12 h-6 cursor-pointer"
          onClick={() => setAvailableOnly(!availableOnly)}
        >
          <div
            className={`w-full h-full rounded-full transition-colors duration-200 ease-in-out ${
              availableOnly ? "bg-green" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              availableOnly ? "translate-x-6" : ""
            }`}
          ></div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Загрузка...</div>
      ) : filteredTournaments.length === 0 ? (
        <div className="text-center py-4">Нет доступных турниров</div>
      ) : (
        filteredTournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))
      )}
    </div>
  )
}
