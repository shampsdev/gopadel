import HugeHeader from "@/components/HugeHeader"
import Divider from "@/components/ui/Divider"
import GreenButton from "@/components/ui/GreenButton"
import useUserStore from "@/stores/userStore"
import { FaEdit } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { FaHistory } from "react-icons/fa"

export default function ProfilePage() {
  const { userData } = useUserStore()
  const navigate = useNavigate()

  return (
    <div className="p-4 min-h-screen flex flex-col">
      <HugeHeader />
      <h1 className="text-2xl font-bold text-center mt-6">Профиль</h1>

      <div className="flex flex-col gap-2 bg-form rounded-xl p-4 mt-6">
        <div>
          <div className="opacity-50">Имя</div>
          <div>
            {userData?.first_name} {userData?.second_name}
          </div>
        </div>
        <Divider />
        <div>
          <div className="opacity-50">Ранг</div>
          <div>{userData?.rank}</div>
        </div>
        <Divider />
        <div>
          <div className="opacity-50">Город</div>
          <div>{userData?.city}</div>
        </div>

        {userData?.birth_date && (
          <>
            <Divider />
            <div>
              <div className="opacity-50">Дата рождения</div>
              <div>{userData?.birth_date}</div>
            </div>
          </>
        )}
        <Divider />
        <div>
          <div className="opacity-50">Уровень лояльности</div>
          <div>
            {userData?.loyalty.name} (скидка {userData?.loyalty.discount}%)
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-3 justify-end">
        <Link
          to={"/pofile/history"}
          className="text-white font-semibold pressable bg-gray-500 rounded-xl py-3"
        >
          <div className="flex items-center justify-center gap-2">
            <FaHistory size={18} />
            История турниров
          </div>
        </Link>
        <GreenButton
          onClick={() => {
            navigate("/profile/edit")
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <FaEdit size={18} />
            Редактировать
          </div>
        </GreenButton>
      </div>
    </div>
  )
}
