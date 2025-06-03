import "./App.css"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import MainPage from "@/pages/MainPage"
import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ProfilePage from "@/pages/ProfilePage"
import RegistrationPage from "@/pages/RegistrationPage"
import ProtectedRoute from "@/components/ProtectedRoute"
import useBackButton from "@/hooks/useBackButton"
import useAuth from "@/hooks/useAuth"
import TournamentPage from "./pages/TournamentPage"
import TournamentParticipantsPage from "./pages/TournamentParticipantsPage"
import EditProfilePage from "./pages/EditProfilePage"
import HistoryPage from "./pages/HistoryPage"
import BottomNavbar from "./components/BottomNavbar"
import PeoplePage from "./pages/PeoplePage"
import UserProfilePage from "./pages/UserProfilePage"
import LoyaltyPage from "./pages/LoyaltyPage"
import LeaguePage from "./pages/LeaguePage"
import { initData, InitData } from "@telegram-apps/sdk-react"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
}

function App() {
  const location = useLocation()

  useBackButton()
  const { checkAuth } = useAuth()

  const navigate = useNavigate()

  useEffect(() => {
    const startParam = initData.startParam()
    if (startParam) {
      if (startParam.startsWith("t-")) {
        const tournamentId = startParam.substring(2)
        navigate(`/tournament/${tournamentId}`)
      }
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="bg-main w-[100vw] h-[100vh] overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          {...{
            initial: "initial",
            animate: "animate",
            exit: "exit",
            variants: pageVariants,
          }}
          style={{ height: "100%" }}
        >
          <Routes location={location}>
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="/" element={<MainPage />} />

              <Route path="profile">
                <Route index element={<ProfilePage />} />
                <Route path="edit" element={<EditProfilePage />} />
                <Route path="history" element={<HistoryPage />} />
              </Route>

              <Route path="people">
                <Route index element={<PeoplePage />} />
                <Route path=":userId" element={<UserProfilePage />} />
              </Route>

              <Route path="league" element={<LeaguePage />} />

              <Route path="loyalty" element={<LoyaltyPage />} />

              <Route path="tournament/:id">
                <Route index element={<TournamentPage />} />
                <Route
                  path="participants"
                  element={<TournamentParticipantsPage />}
                />
              </Route>
            </Route>

            <Route path="/register" element={<RegistrationPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {location.pathname !== "/register" && <BottomNavbar />}
    </div>
  )
}

export default App
