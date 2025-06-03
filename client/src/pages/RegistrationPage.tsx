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
import PlayingPositionSelector from "@/components/PlayingPositionSelector"
import { PlayingPosition } from "@/types/user"
import { handleAvatarFileChange } from "@/utils/avatarUpload"
import { handlePendingStartParam } from "@/utils/startParamHandler"

export default function RegistrationPage() {
  const [name, setName] = useState(initData.user()?.first_name ?? "")
  const [secondName, setSecondName] = useState(initData.user()?.last_name ?? "")
  const [bio, setBio] = useState("")
  const [rank, setRank] = useState("1.0")
  const [city, setCity] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [playingPosition, setPlayingPosition] =
    useState<PlayingPosition | null>(null)
  const [padelProfiles, setPadelProfiles] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useTelegramPhoto, setUseTelegramPhoto] = useState(true)

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
    if (initData.user()?.username) {
      const fetchBio = async () => {
        const response = await api.get<{ bio: string }>("/auth/bio", {
          params: { username: initData.user()?.username },
        })
        setBio(response.data.bio)
      }
      fetchBio()
    }
  }, [])

  useEffect(() => {
    if (userData?.is_registered) {
      // Обрабатываем отложенный startParam после успешной регистрации
      handlePendingStartParam(navigate)
      // Если нет отложенного startParam, переходим на главную
      const pendingStartParam = sessionStorage.getItem('pendingStartParam')
      if (!pendingStartParam) {
        navigate("/")
      }
    }
  }, [userData, navigate])

  useEffect(() => {
    // Clean up URL objects when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

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
      // Prepare user data as JSON
      const userData = {
        first_name: name,
        second_name: secondName,
        bio: bio,
        rank: parseFloat(rank),
        city: city,
        birth_date: birthDate ? formatDateForBackend(birthDate) : null,
        playing_position: playingPosition
          ? playingPosition.toLowerCase()
          : null,
        padel_profiles: padelProfiles || null,
      }

      console.log("Sending registration data:", userData)

      const formData = new FormData()
      formData.append("user_data", JSON.stringify(userData))

      // Handle avatar upload
      if (profilePicture) {
        formData.append("avatar", profilePicture)
      } else if (useTelegramPhoto && initData.user()?.photo_url) {
        formData.append("telegram_photo_url", initData.user()?.photo_url || "")
      }

      await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      checkAuth()
    } catch (err: unknown) {
      showPopup({
        title: "Ошибка регистрации",
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
    <div className="p-4 bg-white min-h-screen">
      <HeaderEditAvatar
        onFileChange={handleFileChange}
        previewUrl={previewUrl}
      />
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

        <PlayingPositionSelector
          value={playingPosition}
          onChange={setPlayingPosition}
          title="В каком квадрате играете?"
          optional={true}
        />

        <InputField
          onChangeFunction={setPadelProfiles}
          title="Профили по падел"
          value={padelProfiles}
          maxLength={500}
          placeholder="Ссылки на профили из других рейтинговых платформ
По одной на строку"
          optional={true}
          multiline={true}
          rows={3}
        />

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
          className="mt-4"
        >
          Зарегистрироваться
        </GreenButton>
      </div>
    </div>
  )
}
