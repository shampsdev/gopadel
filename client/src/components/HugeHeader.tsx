import {
  hapticFeedbackImpactOccurred,
  initData,
} from "@telegram-apps/sdk-react"
import { Divider, Text } from "@telegram-apps/telegram-ui"
import { Link } from "react-router-dom"
import blackLogo from "@/assets/logo-black.png"
import useUserStore from "@/stores/userStore"

import { IoIosArrowForward } from "react-icons/io"

initData.restore()

export default function HugeHeader() {
  const { userData } = useUserStore()

  const photoUrl = userData?.avatar || initData?.user()?.photo_url

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
        <div>
          {photoUrl && (
            <img
              src={photoUrl}
              className="w-24 h-24 rounded-full object-cover"
              alt={"profile photo"}
            />
          )}
        </div>
      </div>
    </div>
  )
}
