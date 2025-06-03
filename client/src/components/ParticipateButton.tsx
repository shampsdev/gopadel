import React, { useState } from "react"
import GreenButton from "@/components/ui/GreenButton"
import PaymentWidget from "@/components/PaymentWidget"
import { registerForTournament, cancelRegistrationBeforePayment } from "@/api/api"
import { backButton } from "@telegram-apps/sdk-react"
import { Registration, RegistrationStatus } from "@/types/registration"

type ParticipateButtonProps = {
  tournamentId: string
  registration: Registration | null
  disabled?: boolean
  callback?: () => void
  isReturning?: boolean
}

export default function ParticipateButton({
  tournamentId,
  registration,
  callback,
  isReturning = false,
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
        callback?.()
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

  const handleCancelBeforePayment = async () => {
    setLoading(true)
    try {
      const result = await cancelRegistrationBeforePayment(tournamentId)
      if (result) {
        setCurrentRegistration(null)
        callback?.()
      } else {
        console.error("Failed to cancel registration")
      }
    } catch (error) {
      console.error("Error canceling registration:", error)
    } finally {
      setLoading(false)
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
    return isReturning ? "Вернуться" : "Зарегистрироваться"
  }

  // If we have a pending registration with payment, show payment and cancel options
  if (
    currentRegistration?.status === RegistrationStatus.PENDING &&
    currentRegistration?.payment &&
    !showPayment
  ) {
    return (
      <div className="w-full space-y-2">
        <GreenButton onClick={handlePayClick} className="w-full rounded-full">
          Оплатить
        </GreenButton>
        <GreenButton 
          onClick={handleCancelBeforePayment} 
          isLoading={loading}
          buttonClassName="bg-red-500 hover:bg-red-600"
          className="w-full rounded-full"
        >
          Отменить регистрацию
        </GreenButton>
      </div>
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
