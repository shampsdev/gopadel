import {
  hapticFeedbackImpactOccurred,
  initData,
} from "@telegram-apps/sdk-react"

import { Link } from "react-router-dom"
import blackLogo from "@/assets/logo-black.png"
import Divider from "@/components/ui/Divider"
import { IoIosArrowForward } from "react-icons/io"

initData.restore()

export default function Header() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex-1 flex items-center gap-1">
          <img src={blackLogo} className="h-5" alt="" />
        </div>
        <Link
          to="/profile"
          className="flex-1"
          onClick={() => hapticFeedbackImpactOccurred.ifAvailable("medium")}
        >
          <div className="flex justify-end">
            <div className="flex gap-4 pressable items-center bg-form p-2 pl-4 rounded-full">
              <div className="flex flex-col">
                <span className="font-semibold">
                  {initData?.user()?.first_name ?? "Личный кабинет"}
                </span>
                <div className="flex items-center opacity-60">
                  <span className="text-xxs">Профиль</span>
                  <IoIosArrowForward size={10} />
                </div>
              </div>
              <img
                src={initData?.user()?.photo_url}
                className="w-9 rounded-full"
                alt=""
              />
            </div>
          </div>
        </Link>
      </div>
      <div className="my-4">
        <Divider />
      </div>
    </div>
  )
}
