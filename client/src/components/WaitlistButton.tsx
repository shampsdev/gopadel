import React, { useState } from "react"
import GreenButton from "@/components/ui/GreenButton"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { addToWaitlist, removeFromWaitlist } from "@/api/api"
import { Waitlist } from "@/types/waitlist"

type WaitlistButtonProps = {
  tournamentId: string
  waitlistEntry: Waitlist | null
  callback?: () => void
  disabled?: boolean
}

export default function WaitlistButton({
  tournamentId,
  waitlistEntry,
  callback,
  disabled = false,
}: WaitlistButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [currentWaitlistEntry, setCurrentWaitlistEntry] = useState<Waitlist | null>(waitlistEntry)

  const handleAddToWaitlist = async () => {
    setLoading(true)
    try {
      const result = await addToWaitlist(tournamentId)
      if (result) {
        setCurrentWaitlistEntry(result)
        callback?.()
      } else {
        console.error("Failed to add to waitlist")
      }
    } catch (error) {
      console.error("Error adding to waitlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWaitlist = async () => {
    setLoading(true)
    try {
      const success = await removeFromWaitlist(tournamentId)
      if (success) {
        setCurrentWaitlistEntry(null)
        setShowCancelDialog(false)
        callback?.()
      } else {
        console.error("Failed to remove from waitlist")
      }
    } catch (error) {
      console.error("Error removing from waitlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleCancelDialogClose = () => {
    if (!loading) {
      setShowCancelDialog(false)
    }
  }

  const buttonText = currentWaitlistEntry 
    ? "Отменить запись в лист ожидания"
    : "Записаться в лист ожидания"

  const buttonColor = currentWaitlistEntry 
    ? "bg-amber-500 hover:bg-amber-600"
    : "bg-blue-500 hover:bg-blue-600"

  return (
    <>
      <GreenButton
        onClick={currentWaitlistEntry ? handleCancelClick : handleAddToWaitlist}
        isLoading={loading}
        disabled={disabled}
        buttonClassName={buttonColor}
        className="w-full rounded-full"
      >
        {buttonText}
      </GreenButton>

      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Отменить запись"
        message="Вы точно уверены, что хотите отменить запись в лист ожидания?"
        confirmText="Да, отменить"
        cancelText="Вернуться"
        onConfirm={handleRemoveFromWaitlist}
        onCancel={handleCancelDialogClose}
        isLoading={loading}
      />
    </>
  )
} 