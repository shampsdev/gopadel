import { backButton, closeMiniApp } from "@telegram-apps/sdk-react"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function useBackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    const currentPath = location.pathname

    // Store navigation history in sessionStorage
    const updateNavigationHistory = () => {
      const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]')
      
      // Don't add duplicate entries
      if (history.length === 0 || history[history.length - 1] !== currentPath) {
        // Keep only the last 10 entries to avoid excessive storage
        if (history.length >= 10) {
          history.shift()
        }
        history.push(currentPath)
        sessionStorage.setItem('navigationHistory', JSON.stringify(history))
      }
    }
    
    updateNavigationHistory()

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

      // Get navigation history
      const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]')
      
      // Tournament participant navigation logic
      if (currentPath.match(/^\/people\/[^/]+$/)) {
        // If we're on a user profile page, check if we came from tournament participants
        const previousPath = history.length >= 2 ? history[history.length - 2] : null
        
        if (previousPath && previousPath.includes('/tournament/') && previousPath.includes('/participants')) {
          // Go back to the tournament participants page
          navigate(previousPath)
          return
        } else {
          // Otherwise go to the people list
          navigate('/people')
          return
        }
      }
      
      // Tournament participants page navigation
      if (currentPath.match(/^\/tournament\/[^/]+\/participants$/)) {
        const tournamentId = currentPath.split("/")[2]
        navigate(`/tournament/${tournamentId}`)
        return
      }
      
      // Tournament waitlist page navigation
      if (currentPath.match(/^\/tournament\/[^/]+\/waitlist$/)) {
        const tournamentId = currentPath.split("/")[2]
        navigate(`/tournament/${tournamentId}`)
        return
      }

      // Default navigation logic for other pages
      let targetPath = "/"

      if (currentPath === "/profile/edit") {
        targetPath = "/profile"
      } else if (currentPath === "/profile/history") {
        targetPath = "/profile"
      } else if (currentPath === "/people") {
        targetPath = "/"
      } else if (currentPath === "/loyalty") {
        targetPath = "/profile"
      }

      navigate(targetPath)
    }

    backButton.onClick(handleBackClick)

    return () => {
      backButton.offClick(handleBackClick)
    }
  }, [location.pathname, navigate])
}
