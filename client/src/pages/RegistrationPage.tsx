import { useEffect, useState } from "react"
import { initData, openPopup, popup, showPopup } from "@telegram-apps/sdk-react"
import HugeHeader from "@/components/HugeHeader"
import InputField from "@/components/InputField"
import SimpleCitySelector from "@/components/SimpleCitySelector"
import { isValidDateFormat, formatDateForBackend } from "@/utils/date"
import { api } from "@/api/api"
import { useNavigate } from "react-router-dom"
import useAuth from "@/hooks/UseAuth"
import useUserStore from "@/stores/userStore"
export default function RegistrationPage() {
  const [name, setName] = useState(initData.user()?.first_name ?? "")
  const [secondName, setSecondName] = useState(initData.user()?.last_name ?? "")
  const [rank, setRank] = useState("")
  const [city, setCity] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { checkAuth } = useAuth()
  const { userData } = useUserStore()
  const navigate = useNavigate()

  const validateRank = (value: string): boolean => {
    if (!value) return false

    const rankValue = parseFloat(value)
    return !isNaN(rankValue) && rankValue >= 1.0 && rankValue <= 7.0
  }

  const hasErrors = {
    name: !name.trim(),
    secondName: !secondName.trim(),
    rank: !validateRank(rank),
    city: !city,
  }

  const formIsValid =
    !hasErrors.name &&
    !hasErrors.secondName &&
    !hasErrors.rank &&
    !hasErrors.city &&
    (birthDate === "" || isValidDateFormat(birthDate))

  useEffect(() => {
    if (userData?.is_registered) {
      navigate("/")
    }
  }, [userData])

  const handleRankChange = (value: string) => {
    const sanitizedValue = value.replace(/[^\d.]/g, "")

    const parts = sanitizedValue.split(".")
    const formattedValue =
      parts.length > 1
        ? `${parts[0]}.${parts.slice(1).join("")}`
        : sanitizedValue

    if (parts.length > 1 && parts[1].length > 2) {
      return
    }

    const numValue = parseFloat(formattedValue)
    if (!isNaN(numValue)) {
      if (numValue > 7.0) {
        setRank("7.0")
        return
      }

      if (numValue < 1.0) {
        setRank("1.0")
        return
      }
    }

    setRank(formattedValue)
  }

  const handleRankBlur = () => {
    if (rank) {
      const value = parseFloat(rank)
      if (!isNaN(value) && value >= 1.0 && value <= 7.0) {
        if (!rank.includes(".")) {
          setRank(`${rank}.0`)
        } else if (rank.endsWith(".")) {
          setRank(`${rank}0`)
        }
      }
    }
  }

  const handleSubmit = async () => {
    if (!formIsValid || isSubmitting) return

    setIsSubmitting(true)

    try {
      const formattedData = {
        first_name: name,
        second_name: secondName,
        rank: parseFloat(rank),
        city: city,
        birth_date: birthDate ? formatDateForBackend(birthDate) : null,
      }

      await api.post("/auth/register", formattedData)
      checkAuth()
    } catch (err: any) {
      showPopup({
        title: "Ошибка регистрации",
        message:
          err.response?.data?.message || "Произошла ошибка при отправке данных",
        buttons: [{ id: "ok", type: "ok" }],
      })
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      <HugeHeader />
      <div className="mt-10 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">Регистрация</h1>

        <InputField
          onChangeFunction={setName}
          title="Имя"
          value={name}
          maxLength={100}
        />

        <InputField
          onChangeFunction={setSecondName}
          title="Фамилия"
          value={secondName}
          maxLength={100}
        />

        <InputField
          onChangeFunction={handleRankChange}
          onBlur={handleRankBlur}
          title="Ранг"
          value={rank}
          maxLength={3}
          validation={validateRank}
          placeholder="1.0 - 7.0"
        />

        <SimpleCitySelector value={city} onChange={setCity} title="Город" />

        <InputField
          onChangeFunction={setBirthDate}
          title="Дата рождения (опционально)"
          value={birthDate}
          maxLength={10}
          type="date"
          placeholder="дд.мм.гггг"
          optional={true}
        />

        <button
          onClick={handleSubmit}
          disabled={!formIsValid || isSubmitting}
          className={`mt-4 py-3 px-6 rounded-xl font-semibold text-white ${
            formIsValid && !isSubmitting
              ? "bg-[#20C86E] hover:bg-[#1BA15C]"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Отправка..." : "Зарегистрироваться"}
        </button>
      </div>
    </div>
  )
}
