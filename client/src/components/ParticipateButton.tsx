import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import GreenButton from "@/components/ui/GreenButton"
import { registerForTournament } from "@/api/api"
import { backButton } from "@telegram-apps/sdk-react"

type ParticipateButtonProps = {
  tournamentId: string
  isParticipating?: boolean
  disabled?: boolean
  isWaitlist?: boolean
}

export default function ParticipateButton({
  tournamentId,
  isParticipating = false,
  disabled = false,
  isWaitlist = false,
}: ParticipateButtonProps) {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleParticipate = async () => {
    setLoading(true)
    backButton.hide()
    try {
      const registration = await registerForTournament(tournamentId)
      if (registration?.payment) {
        window.location.href = registration.payment.payment_link
      } else {
        console.error("Failed to register for tournament")
      }
    } catch (error) {
      console.error("Error participating in tournament:", error)
    } finally {
      setLoading(false)
    }
  }

  const buttonText = () => {
    if (isParticipating) return "Вы участвуете"
    if (isWaitlist) return "Записаться в лист ожидания"
    return "Разегистрироваться и оплатить"
  }

  return (
    <GreenButton
      onClick={handleParticipate}
      disabled={isParticipating || disabled}
      isLoading={loading}
      className="w-full rounded-full"
    >
      {buttonText()}
    </GreenButton>
  )
}
