import React, { useState } from "react"
import GreenButton from "@/components/ui/GreenButton"
import PaymentWidget from "@/components/PaymentWidget"
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
  const [showPayment, setShowPayment] = useState(false)
  const [currentRegistration, setCurrentRegistration] =
    useState<Registration | null>(registration)

  const handleRegister = async () => {
    setLoading(true)
    backButton.hide()
    try {
      const newRegistration = await registerForTournament(tournamentId)
      if (newRegistration) {
        setCurrentRegistration(newRegistration)
      } else {
        console.error("Failed to register for tournament")
      }
    } catch (error) {
      console.error("Error participating in tournament:", error)
    } finally {
      setLoading(false)
    }
  }
  const handlePay = async () => {
    setLoading(true)
    backButton.hide()
    try {
      const newRegistration = await registerForTournament(tournamentId)
      if (newRegistration) {
        setCurrentRegistration(newRegistration)
        if (
          newRegistration.payment &&
          newRegistration.status === RegistrationStatus.PENDING
        ) {
          setShowPayment(true)
        } else {
          // Free tournament or already active
          callback?.()
        }
      } else {
        console.error("Failed to register for tournament")
      }
    } catch (error) {
      console.error("Error participating in tournament:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayClick = () => {
    if (currentRegistration?.payment) {
      setShowPayment(true)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    callback?.()
  }

  const handlePaymentError = (error: unknown) => {
    console.error("Payment failed:", error)
    setShowPayment(false)
  }

  const buttonText = () => {
    if (currentRegistration?.status === RegistrationStatus.PENDING)
      return "Оплатить"
    return "Зарегистрироваться"
  }

  // If we have a pending registration with payment, show payment option
  if (
    currentRegistration?.status === RegistrationStatus.PENDING &&
    currentRegistration?.payment &&
    !showPayment
  ) {
    return (
      <GreenButton onClick={handlePayClick} className="w-full rounded-full">
        Оплатить
      </GreenButton>
    )
  }

  if (showPayment && currentRegistration?.payment) {
    return (
      <div className="w-full space-y-4">
        <PaymentWidget
          confirmationToken={currentRegistration.payment.confirmation_token}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => setShowPayment(false)}
        />
      </div>
    )
  }

  return (
    <GreenButton
      onClick={
        currentRegistration?.status === RegistrationStatus.PENDING
          ? handlePay
          : handleRegister
      }
      isLoading={loading}
      className="w-full rounded-full"
    >
      {buttonText()}
    </GreenButton>
  )
}
