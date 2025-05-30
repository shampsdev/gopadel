import React, { useEffect, useRef, useCallback } from "react"

interface PaymentWidgetProps {
  confirmationToken: string
  onSuccess: () => void
  onError: (error: unknown) => void
  onClose: () => void
}

declare global {
  interface Window {
    YooMoneyCheckoutWidget: unknown
  }
}

export default function PaymentWidget({
  confirmationToken,
  onSuccess,
  onError,
  onClose,
}: PaymentWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)
  const checkoutRef = useRef<unknown>(null)

  const initializeWidget = useCallback(() => {
    if (!widgetRef.current || !window.YooMoneyCheckoutWidget) return

    try {
      const checkout = new (window.YooMoneyCheckoutWidget as unknown as new (config: {
        confirmation_token: string
        customization: {
          modal: boolean
          colors: {
            control_primary: string
          }
        }
        error_callback: (error: unknown) => void
      }) => {
        render: (elementId: string) => void
        on: (event: string, callback: () => void) => void
        destroy?: () => void
      })({
        confirmation_token: confirmationToken,
        customization: {
          modal: true,
          colors: {
            control_primary: "#00b956", // Green color to match app theme
          },
        },
        error_callback: function (error: unknown) {
          console.error("Payment error:", error)
          onError(error)
        },
      })

      checkoutRef.current = checkout

      // Render the widget
      checkout.render("payment-form")

      // Listen for payment completion
      checkout.on("complete", () => {
        console.log("Payment completed successfully")
        onSuccess()
      })

      // Listen for modal close
      checkout.on("modal_close", () => {
        console.log("Payment modal closed")
        onClose()
        // Don't call onError here as user might just close the modal
      })
    } catch (error) {
      console.error("Error initializing widget:", error)
      onError(error)
    }
  }, [confirmationToken, onSuccess, onError, onClose])

  useEffect(() => {
    // Load YooKassa widget script if not loaded
    if (!window.YooMoneyCheckoutWidget) {
      const script = document.createElement("script")
      script.src = "https://yookassa.ru/checkout-widget/v1/checkout-widget.js"
      script.async = true
      script.onload = () => {
        initializeWidget()
      }
      document.head.appendChild(script)
    } else {
      initializeWidget()
    }

    return () => {
      // Clean up widget if component unmounts
      if (checkoutRef.current) {
        try {
          const checkout = checkoutRef.current as { destroy?: () => void }
          checkout.destroy?.()
        } catch (error) {
          console.warn("Error destroying widget:", error)
        }
      }
    }
  }, [initializeWidget])

  return (
    <div className="w-full">
      <div
        id="payment-form"
        ref={widgetRef}
        className="w-full min-h-[400px]"
      ></div>
    </div>
  )
}
