import { backButton } from "@telegram-apps/sdk-react"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function useBackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (location.pathname !== "/") {
      backButton.show()
      backButton.onClick(() => {
        navigate(-1)
      })
    } else {
      backButton.hide()
    }
  }, [location.pathname])
}
