import Header from "@/components/Header"
import TournamentList from "@/components/TournamentList"

export default function MainPage() {
  return (
    <div className="p-4 bg-white min-h-screen pb-20">
      <Header />

      <h1 className="text-center font-semibold text-2xl mb-6 mt-2 text-gray-800">
        Турниры
      </h1>

      <TournamentList />
    </div>
  )
}
