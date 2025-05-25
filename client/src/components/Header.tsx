import {
  hapticFeedbackImpactOccurred,
  initData,
} from "@telegram-apps/sdk-react"

import { Link } from "react-router-dom"
import blackLogo from "@/assets/logo-black.png"
import Divider from "@/components/ui/Divider"
import { IoIosArrowForward } from "react-icons/io"
import useUserStore from "@/stores/userStore"

initData.restore()

export default function Header() {
  const { userData } = useUserStore()

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
                <span className="font-semibold truncate max-w-32">
                  {userData?.is_registered
                    ? `${userData.first_name}`
                    : initData?.user()?.first_name}
                </span>
                <div className="flex items-center opacity-60">
                  <span className="text-xxs">Профиль</span>
                  <IoIosArrowForward size={10} />
                </div>
              </div>
              <div className="aspect-square">
                <img
                  src={userData?.avatar || ""}
                  className="w-9 rounded-full aspect-square object-cover"
                  alt=""
                />
              </div>
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
