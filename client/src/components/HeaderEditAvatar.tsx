import {
  hapticFeedbackImpactOccurred,
  initData,
} from "@telegram-apps/sdk-react"
import { Divider, Text } from "@telegram-apps/telegram-ui"
import { Link } from "react-router-dom"
import blackLogo from "@/assets/logo-black.png"
import useUserStore from "@/stores/userStore"
import { useState, useRef, useEffect } from "react"
import { IoIosArrowForward } from "react-icons/io"

initData.restore()

interface HeaderEditAvatarProps {
  onFileChange: (file: File | null) => void
  previewUrl: string | null
}

export default function HeaderEditAvatar({
  onFileChange,
  previewUrl,
}: HeaderEditAvatarProps) {
  const { userData } = useUserStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use preview URL if available, otherwise use user avatar or telegram photo
  const displayPhotoUrl =
    previewUrl || userData?.avatar || initData?.user()?.photo_url

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileChange(file)
    }
  }

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex flex-1 py-4 flex-col justify-between">
          <div>
            <img src={blackLogo} className="h-7" alt="" />
          </div>
          {!!initData?.user()?.username && (
            <span className="text-xl opacity-60 font-semibold">
              @{userData?.username || initData?.user()?.username}
            </span>
          )}
        </div>
        <div className="relative" onClick={handleClick}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg"
            className="hidden"
          />
          {displayPhotoUrl ? (
            <img
              src={displayPhotoUrl}
              className="w-24 h-24 rounded-full aspect-square object-cover cursor-pointer"
              alt="profile photo"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
              <span className="text-4xl text-gray-400">+</span>
            </div>
          )}
          <span className="bg-green text-white absolute -bottom-0 font-semibold left-1/2 -translate-x-1/2 px-2 rounded-full text-xs cursor-pointer">
            {displayPhotoUrl ? "Изменить" : "Добавить"}
          </span>
        </div>
      </div>
    </div>
  )
}
