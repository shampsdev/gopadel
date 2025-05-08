import {
  hapticFeedbackImpactOccurred,
  initData,
} from "@telegram-apps/sdk-react"
import { Divider, Text } from "@telegram-apps/telegram-ui"
import { Link } from "react-router-dom"
import blackLogo from "@/assets/logo-black.png"

import { IoIosArrowForward } from "react-icons/io"

initData.restore()

export default function Header() {
  return (
    <div>
      <div className="flex justify-between">
        <div className="flex flex-1 py-4 flex-col justify-between">
          <div>
            <img src={blackLogo} className="h-7" alt="" />
          </div>
          {!!initData?.user()?.username && (
            <span className="text-xl opacity-60 font-semibold">
              @{initData?.user()?.username}
            </span>
          )}
        </div>
        <div>
          <img
            src={initData?.user()?.photo_url}
            className="w-24 rounded-full"
            alt=""
          />
        </div>
      </div>
    </div>
  )
}
