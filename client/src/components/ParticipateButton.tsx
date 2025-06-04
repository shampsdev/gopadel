import React, { useState } from "react"
import GreenButton from "@/components/ui/GreenButton"
import { registerForTournament, cancelRegistrationBeforePayment, createPaymentForTournament } from "@/api/api"
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
  
  const handleCreatePayment = async () => {
    setLoading(true)
    backButton.hide()
    try {
      const updatedRegistration = await createPaymentForTournament(tournamentId)
      if (updatedRegistration) {
        setCurrentRegistration(updatedRegistration)
        // Open payment link if available
        if (updatedRegistration.payment?.payment_link) {
          window.open(updatedRegistration.payment.payment_link, '_blank')
        }
        callback?.()
      } else {
        console.error("Failed to create payment for tournament")
      }
    } catch (error) {
      console.error("Error creating payment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayClick = () => {
    if (currentRegistration?.payment?.payment_link) {
      // Open payment link in new tab
      window.open(currentRegistration.payment.payment_link, '_blank')
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

  const buttonText = () => {
    if (currentRegistration?.status === RegistrationStatus.PENDING) {
      return currentRegistration?.payment ? "Оплатить" : "Оплатить"
    }
    return isReturning ? "Вернуться" : "Зарегистрироваться"
  }

  if (currentRegistration?.status === RegistrationStatus.PENDING) {
    return (
      <div className="w-full space-y-2">
        {currentRegistration?.payment && 
         currentRegistration.payment.status !== "canceled" ? (
          <GreenButton onClick={handlePayClick} className="w-full rounded-full">
            Оплатить
          </GreenButton>
        ) : (
          // No payment yet or payment is canceled, create new payment
          <GreenButton onClick={handleCreatePayment} isLoading={loading} className="w-full rounded-full">
            Оплатить
          </GreenButton>
        )}
        <GreenButton 
          onClick={handleCancelBeforePayment} 
          isLoading={loading}
          buttonClassName="bg-red-500 hover:bg-red-600"
          className="w-full rounded-full"
        >
          Отменить регистрацию
        </GreenButton>
        <p className="text-xs text-gray-500 text-center mt-2">
          При нажатии откроется страница оплаты в новой вкладке
        </p>
      </div>
    )
  }

  return (
    <GreenButton
      onClick={handleRegister}
      isLoading={loading}
      className="w-full rounded-full"
    >
      {buttonText()}
    </GreenButton>
  )
}
