import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import GreenButton from "@/components/ui/GreenButton"
import { registerForTournament } from "@/api/api"
import { backButton } from "@telegram-apps/sdk-react"
import { Registration, RegistrationStatus } from "@/types/registration"

type ParticipateButtonProps = {
  tournamentId: string
  registration: Registration | null
  disabled?: boolean
  callback?: () => void
}

export default function ParticipateButton({
  tournamentId,
  registration,
  callback,
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
        callback?.()
      }
    } catch (error) {
      console.error("Error participating in tournament:", error)
    } finally {
      setLoading(false)
    }
  }

  const buttonText = () => {
    if (registration?.status === RegistrationStatus.PENDING) return "Оплатить"
    return "Зарегистрироваться и оплатить"
  }

  return (
    <GreenButton
      onClick={handleParticipate}
      isLoading={loading}
      className="w-full rounded-full"
    >
      {buttonText()}
    </GreenButton>
  )
}
