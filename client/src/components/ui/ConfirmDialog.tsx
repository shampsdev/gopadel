import React from 'react'
import { createPortal } from 'react-dom'
import GreenButton from './GreenButton'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Да",
  cancelText = "Нет",
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const dialogContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6 text-center leading-relaxed">
          {message}
        </p>
        
        <div className="flex flex-col gap-3">
          <GreenButton
            onClick={onConfirm}
            isLoading={isLoading}
            buttonClassName="bg-red-500 hover:bg-red-600"
            className="w-full"
          >
            {confirmText}
          </GreenButton>
          
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
} 