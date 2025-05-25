import { getUserTournaments } from "@/api/api"
import HistoryCard from "@/components/HistoryCard"
import HugeHeader from "@/components/HugeHeader"
import useUserStore from "@/stores/userStore"
import { Registration, RegistrationWithTournament } from "@/types/registration"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function HistoryPage() {
  const { userData } = useUserStore()
  const [registrations, setRegistrations] = useState<
    RegistrationWithTournament[]
  >([])

  useEffect(() => {
    if (userData) {
      getUserTournaments(userData.id).then((registrations) => {
        setRegistrations(registrations)
      })
    }
  }, [userData])

  return (
    <div className="p-4 flex flex-col min-h-screen">
      <HugeHeader />
      <h1 className="text-2xl font-bold text-center mt-4">История участия</h1>
      <div className="mt-4">
        {registrations.map((registration) => (
          <Link
            key={registration.id}
            to={`/tournament/${registration.tournament.id}`}
          >
            <HistoryCard registration={registration} />
          </Link>
        ))}
      </div>
    </div>
  )
}
