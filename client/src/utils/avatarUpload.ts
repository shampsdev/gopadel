export const addAvatarToFormData = (
  formData: FormData,
  profilePicture: File | null,
  useTelegramPhoto: boolean,
  telegramPhotoUrl?: string
): void => {
  // If using Telegram photo, pass the URL directly
  if (useTelegramPhoto && telegramPhotoUrl) {
    formData.append("telegram_photo_url", telegramPhotoUrl)
  }
  // Otherwise, upload the file if available
  else if (profilePicture) {
    formData.append("avatar", profilePicture)
  }
}

export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file)
}

export const handleAvatarFileChange = (
  file: File | null,
  setProfilePicture: (file: File | null) => void,
  setUseTelegramPhoto: (use: boolean) => void,
  setPreviewUrl: (url: string | null) => void
): void => {
  if (file) {
    setProfilePicture(file)
    setUseTelegramPhoto(false)

    // Create preview URL
    const objectUrl = createPreviewUrl(file)
    setPreviewUrl(objectUrl)
  }
}
