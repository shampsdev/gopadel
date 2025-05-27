import React from "react"
import { CrownIcon } from "lucide-react"

interface LoyaltyBadgeProps {
  loyaltyId: number
  size?: "sm" | "md" | "lg"
  showName?: boolean
  name?: string
}

// Loyalty badges with crown icons
const getLoyaltyBadgeIcon = (loyaltyId: number) => {
  switch (loyaltyId) {
    case 1: // Rookie
      return (
        <div className="flex items-center justify-center w-full h-full rounded-full bg-gray-100 border border-gray-300">
          <CrownIcon className="text-gray-400" />
        </div>
      )
    case 2: // Player
      return (
        <div className="flex items-center justify-center w-full h-full rounded-full bg-green-50 border border-green-300">
          <CrownIcon className="text-green-500" />
        </div>
      )
    case 3: // Pro
      return (
        <div className="flex items-center justify-center w-full h-full rounded-full bg-blue-50 border border-blue-300">
          <CrownIcon className="text-blue-500" />
        </div>
      )
    case 4: // Aksakal
      return (
        <div className="flex items-center justify-center w-full h-full rounded-full bg-purple-50 border border-purple-300">
          <CrownIcon className="text-purple-500" />
        </div>
      )
    case 5: // Ambassador
      return (
        <div className="flex items-center justify-center w-full h-full rounded-full bg-yellow-50 border border-yellow-300">
          <CrownIcon className="text-yellow-500" />
        </div>
      )
    default:
      return (
        <div className="flex items-center justify-center w-full h-full rounded-full bg-gray-100 border border-gray-300">
          <CrownIcon className="text-gray-400" />
        </div>
      )
  }
}

export default function LoyaltyBadge({ loyaltyId, size = "md", showName = false, name }: LoyaltyBadgeProps) {
  // Adjusted sizes to be more compact on mobile
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-14 h-14"
  }

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-7 h-7"
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        {React.cloneElement(getLoyaltyBadgeIcon(loyaltyId), { className: `${iconSizeClasses[size]} ${getLoyaltyBadgeIcon(loyaltyId).props.className}` })}
      </div>
      {showName && name && (
        <span className={`mt-2 text-center ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}`}>
          {name}
        </span>
      )}
    </div>
  )
} 