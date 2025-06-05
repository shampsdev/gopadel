import { backButton, closeMiniApp } from "@telegram-apps/sdk-react"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function useBackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    const currentPath = location.pathname

    if (currentPath === "/" || currentPath === "/people" || currentPath === "/league" || currentPath === "/profile") {
      sessionStorage.removeItem('fromTournamentLink')
      sessionStorage.removeItem('sourceTournamentId')
    }

    if (currentPath === "/") {
      backButton.hide()
      return
    }

    backButton.show()

    const handleBackClick = () => {
      if (currentPath === "/register") {
        closeMiniApp()
        return
      }

      const fromTournamentLink = sessionStorage.getItem('fromTournamentLink') === 'true'
      const sourceTournamentId = sessionStorage.getItem('sourceTournamentId')
      
      if (currentPath.startsWith("/tournament/") && fromTournamentLink && !currentPath.includes("/participants") && !currentPath.includes("/waitlist")) {
        const currentTournamentId = currentPath.split("/")[2]
        if (currentTournamentId === sourceTournamentId) {
          navigate("/")
          return
        }
      }

      let targetPath = "/"

      if (currentPath === "/profile/edit") {
        targetPath = "/profile"
      }

      if (currentPath === "/people") {
        targetPath = "/"
      } else if (currentPath.startsWith("/people/")) {
        targetPath = "/people"
      } 
      
      if (currentPath === "/loyalty") {
        targetPath = "/profile"
      }
      
      if (currentPath.startsWith("/tournament/")) {
        if (currentPath.includes("/participants")) {
          const tournamentId = currentPath.split("/")[2]
          targetPath = `/tournament/${tournamentId}`
        } else if (currentPath.includes("/waitlist")) {
          const tournamentId = currentPath.split("/")[2]
          targetPath = `/tournament/${tournamentId}`
        }
      }

      navigate(targetPath)
    }

    backButton.onClick(handleBackClick)

    return () => {
      backButton.offClick(handleBackClick)
    }
  }, [location.pathname, navigate])
}
