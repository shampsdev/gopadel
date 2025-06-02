import { backButton } from "@telegram-apps/sdk-react"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function useBackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    const currentPath = location.pathname

    if (currentPath === "/") {
      backButton.hide()
      return
    }

    backButton.show()

    const handleBackClick = () => {
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
