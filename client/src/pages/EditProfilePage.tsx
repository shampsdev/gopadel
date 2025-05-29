import { useEffect, useState } from "react"
import { initData, showPopup } from "@telegram-apps/sdk-react"
import InputField from "@/components/InputField"
import SimpleCitySelector from "@/components/SimpleCitySelector"
import { isValidDateFormat, formatDateForBackend } from "@/utils/date"
import { api } from "@/api/api"
import { useNavigate } from "react-router-dom"
import useAuth from "@/hooks/useAuth"
import useUserStore from "@/stores/userStore"
import GreenButton from "@/components/ui/GreenButton"
import HeaderEditAvatar from "@/components/HeaderEditAvatar"
import RatingSelector from "@/components/RatingSelector"
import {
  addAvatarToFormData,
  handleAvatarFileChange,
} from "@/utils/avatarUpload"

export default function EditProfilePage() {
  const [name, setName] = useState(initData.user()?.first_name ?? "")
  const [secondName, setSecondName] = useState(initData.user()?.last_name ?? "")
  const [bio, setBio] = useState("")
  const [rank, setRank] = useState("")
  const [city, setCity] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useTelegramPhoto, setUseTelegramPhoto] = useState(false)

  const { checkAuth } = useAuth()
  const { userData } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    setName(userData?.first_name ?? "")
    setSecondName(userData?.second_name ?? "")
    setBio(userData?.bio ?? "")
    setRank(userData?.rank.toString() ?? "")
    setCity(userData?.city ?? "")
    setBirthDate(userData?.birth_date_ru ?? "")
  }, [userData])

  useEffect(() => {
    // Clean up URL objects when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

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

  const handleRankChange = (value: string) => {
    setRank(value)
  }

  const handleFileChange = (file: File | null) => {
    handleAvatarFileChange(
      file,
      setProfilePicture,
      setUseTelegramPhoto,
      setPreviewUrl
    )
  }

  const handleSubmit = async () => {
    if (!formIsValid || isSubmitting) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("first_name", name)
      formData.append("second_name", secondName)
      formData.append("bio", bio)
      formData.append("rank", rank.toString())
      formData.append("city", city)

      if (birthDate) {
        const formattedDate = formatDateForBackend(birthDate)
        if (formattedDate) {
          formData.append("birth_date", formattedDate)
        }
      }

      // Add avatar to form data
      addAvatarToFormData(
        formData,
        profilePicture,
        useTelegramPhoto,
        initData.user()?.photo_url
      )

      await api.patch("/auth/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      checkAuth()
      navigate("/profile")
    } catch (err: unknown) {
      showPopup({
        title: "Ошибка",
        message:
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Произошла ошибка при отправке данных",
        buttons: [{ id: "ok", type: "ok" }],
      })
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 min-h-screen pb-20">
      <HeaderEditAvatar
        onFileChange={handleFileChange}
        previewUrl={previewUrl}
      />
      <div className="mt-6 flex flex-col gap-4 flex-1">
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
          onChangeFunction={setBio}
          title="О себе"
          value={bio}
          maxLength={500}
          optional={true}
          multiline={true}
          rows={4}
        />

        <RatingSelector
          onChange={handleRankChange}
          title="Рейтинг"
          value={rank}
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

        <GreenButton
          onClick={handleSubmit}
          disabled={!formIsValid}
          isLoading={isSubmitting}
          className="mt-auto"
        >
          Сохранить
        </GreenButton>
      </div>
    </div>
  )
}
