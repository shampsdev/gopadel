import React from "react"
import { Link } from "lucide-react"
import { parsePadelProfiles, formatUrl, getDisplayName } from "@/utils/profileUtils"

interface PadelProfilesListProps {
  profilesText: string | null | undefined
  className?: string
}

const PadelProfilesList: React.FC<PadelProfilesListProps> = ({
  profilesText,
  className = ""
}) => {
  const profiles = parsePadelProfiles(profilesText)
  
  if (profiles.length === 0) {
    return null
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      {profiles.map((profile, index) => (
        <div key={index} className="flex items-center">
          <Link size={14} className="mr-2 text-gray-400 flex-shrink-0" />
          <a
            href={formatUrl(profile)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm break-all"
          >
            {getDisplayName(profile)}
          </a>
        </div>
      ))}
    </div>
  )
}

export default PadelProfilesList 