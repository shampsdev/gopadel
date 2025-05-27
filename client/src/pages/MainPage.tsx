import Header from "@/components/Header"
import TournamentList from "@/components/TournamentList"

export default function MainPage() {
  return (
    <div className="p-4 bg-white min-h-screen pb-20">
      <Header />
      <TournamentList />
    </div>
  )
}
