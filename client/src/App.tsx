import "./App.css"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import MainPage from "@/pages/MainPage"
import { useCallback, useEffect } from "react"
import { backButton, initData } from "@telegram-apps/sdk-react"
import { AnimatePresence, motion } from "framer-motion"
import useUserStore from "@/stores/userStore"
import ProfilePage from "@/pages/ProfilePage"
import RegistrationPage from "@/pages/RegistrationPage"
import ProtectedRoute from "@/components/ProtectedRoute"
import useBackButton from "@/hooks/useBackButton"
import useAuth from "@/hooks/useAuth"
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useBackButton()
  const { checkAuth } = useAuth()
  useEffect(() => {
    checkAuth()
    backButton.onClick(() => {
      navigate(-1)
    })
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
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="/register" element={<RegistrationPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
