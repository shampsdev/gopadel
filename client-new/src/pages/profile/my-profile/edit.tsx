import { useNavigate } from "react-router";
import { useGetMe } from "../../../api/hooks/useGetMe";
import { Input } from "../../../components/ui/froms/input";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { useRef, useState, useEffect } from "react";
import Logo from "../../../assets/logo.png";
import { Textarea } from "../../../components/ui/froms/textarea";
import { RankSelector } from "../../../components/ui/froms/rank-selector";
import { Button } from "../../../components/ui/button";
import { usePatchMe } from "../../../api/hooks/mutations/patch-me";
import { uploadAvatar } from "../../../api/user";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { CityInput } from "../../../components/ui/froms/city-input";
import { PositionSelector } from "../../../components/ui/froms/position-selector";
import {
  formatDateInput,
  parseBirthDateToISO,
  validateBirthDate,
} from "../../../utils/date-format";
import type { PlayingPosition } from "../../../types/playing-position.type";
import { ranks } from "../../../shared/constants/ranking";

export const EditProfile = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  const { data: user, isLoading } = useGetMe();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [rankInput, setRankInput] = useState<string>("");
  const [bio, setBio] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [birthDateError, setBirthDateError] = useState<boolean>(false);
  const [city, setCity] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<string | null>(null);
  const [playingPosition, setPlayingPosition] =
    useState<PlayingPosition | null>(null);

  // Состояния для валидации полей
  const [firstNameError, setFirstNameError] = useState<boolean>(false);
  const [lastNameError, setLastNameError] = useState<boolean>(false);
  const [rankError, setRankError] = useState<boolean>(false);
  const [bioError, setBioError] = useState<boolean>(false);
  const [cityError, setCityError] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? null);
      setLastName(user.lastName ?? null);
      setRank(user.rank ?? null);

      // Находим соответствующий ранг по числовому значению
      const userRank = ranks.find(
        (r) => r.from <= (user.rank ?? 0) && (user.rank ?? 0) <= r.to
      );
      setRankInput(userRank?.title ?? "");

      setBio(user.bio ?? null);
      setCity(user.city ?? null);
      setPlayingPosition(user.playingPosition ?? null);
      setProfiles(user.padelProfiles ?? null);

      // Преобразуем дату рождения из ISO в формат дд.мм.гггг
      if (user.birthDate) {
        try {
          const date = new Date(user.birthDate);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = String(date.getFullYear());
          setBirthDate(`${day}.${month}.${year}`);
        } catch (error) {
          console.error("Ошибка парсинга даты рождения:", error);
          setBirthDate(null);
        }
      }
    }
  }, [user]);

  const handleRankChange = (rankTitle: string) => {
    setRankInput(rankTitle);
    const selectedRank = ranks.find((r) => r.title === rankTitle);
    if (selectedRank) {
      setRank(selectedRank.from);
      setRankError(false);
    }
  };

  // Функции валидации
  const validateFirstName = (value: string) => {
    const isValid = value.length > 0;
    setFirstNameError(!isValid);
    return isValid;
  };

  const validateLastName = (value: string) => {
    const isValid = value.length > 0;
    setLastNameError(!isValid);
    return isValid;
  };

  const validateRank = (value: string) => {
    const isValid = value.length > 0;
    setRankError(!isValid);
    return isValid;
  };

  const validateBio = (value: string) => {
    const isValid = value.length > 0;
    setBioError(!isValid);
    return isValid;
  };

  const validateCity = (value: string) => {
    const isValid = value.length > 0;
    setCityError(!isValid);
    return isValid;
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuthStore();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const displayAvatarUrl = previewUrl || uploadedAvatarUrl || user?.avatar;

  const patchMeMutation = usePatchMe();

  const navigate = useNavigate();

  const editProfile = async () => {
    try {
      let avatarUrl = displayAvatarUrl;

      if (selectedFile) {
        try {
          avatarUrl = await uploadAvatar(token!, selectedFile);
          setUploadedAvatarUrl(avatarUrl);
        } catch (error) {
          console.error("Ошибка загрузки аватара:", error);
          alert("Ошибка загрузки аватара");
          return;
        }
      }

      let birthDataISO = null;
      if (birthDate && validateBirthDate(birthDate)) {
        birthDataISO = parseBirthDateToISO(birthDate);
      }

      console.log("avatarUrl", avatarUrl);
      console.log("birthDataISO", birthDataISO);
      await patchMeMutation.mutateAsync({
        avatar: avatarUrl!,
        bio: bio ?? "",
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        rank: rank ?? 0,
        birthDate: birthDataISO ?? undefined,
        city: city ?? "",
        playingPosition: playingPosition ?? "both",
        isRegistered: true,
        padelProfiles: profiles ?? "",
      });

      console.log("send", {
        avatar: avatarUrl!,
        bio: bio ?? "",
        firstName: firstName ?? "",
        birthData: birthDataISO,
        lastName: lastName ?? "",
        rank: rank ?? 0,
        padelProfiles: profiles ?? "",
      });
      navigate(-1);
    } catch (error) {
      alert("Уупс, что-то пошло не так");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-11 mt-3 pb-[100px]">
      <div className="flex flex-row gap-7 items-center">
        <div
          className="aspect-square max-h-[160px] rounded-full overflow-hidden"
          onClick={handleAvatarClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/jpg"
            style={{ display: "none" }}
          />
          <img src={displayAvatarUrl} className="object-cover w-full h-full" />
        </div>
        <div className="flex flex-col w-full gap-2 ">
          <img src={Logo} className="max-w-[140px]" />
          <p className="text-[17px]">@{user?.telegramUsername}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          onChangeFunction={(value) => {
            setFirstName(value);
            validateFirstName(value);
          }}
          onBlur={() => validateFirstName(firstName ?? "")}
          title={"Имя"}
          value={firstName ?? ""}
          maxLength={100}
          hasError={firstNameError}
        />
        <Input
          onChangeFunction={(value) => {
            setLastName(value);
            validateLastName(value);
          }}
          onBlur={() => validateLastName(lastName ?? "")}
          title={"Фамилия"}
          value={lastName ?? ""}
          maxLength={100}
          hasError={lastNameError}
        />
        <RankSelector
          title="Ранг"
          value={rankInput}
          onChangeFunction={handleRankChange}
          hasError={rankError}
        />
        <Textarea
          onChangeFunction={(value) => {
            setBio(value);
            validateBio(value);
          }}
          onBlur={() => validateBio(bio ?? "")}
          title={"О себе"}
          value={bio ?? ""}
          maxLength={255}
          hasError={bioError}
        />
        <Input
          onChangeFunction={(value) => {
            const formatted = formatDateInput(value);
            setBirthDate(formatted);

            if (validateBirthDate(formatted)) {
              setBirthDateError(false);
            } else {
              setBirthDateError(formatted.length > 0);
            }
          }}
          onBlur={() => {
            if (!validateBirthDate(birthDate ?? "")) {
              setBirthDateError(true);
            } else {
              setBirthDateError(false);
            }
          }}
          title={"Дата рождения"}
          value={birthDate ?? ""}
          maxLength={10}
          placeholder={"дд.мм.гггг"}
          hasError={birthDateError}
        />
        <CityInput
          title={"Город"}
          value={city ?? ""}
          onChangeFunction={(value) => {
            setCity(value);
            validateCity(value);
          }}
          onBlur={() => validateCity(city ?? "")}
          maxLength={100}
          hasError={cityError}
        />
        <PositionSelector
          title={"Позиция игры"}
          value={playingPosition}
          onChangeFunction={setPlayingPosition}
        />

        <Textarea
          onChangeFunction={setProfiles}
          title={"Профили по падел"}
          value={profiles ?? ""}
          maxLength={255}
          placeholder={
            "Ссылки на профили из других рейтинговых платформ (по одной на строку)"
          }
        />
      </div>

      {bio?.length &&
      firstName?.length &&
      lastName?.length &&
      rankInput.length > 0 &&
      city?.length &&
      (!birthDate || validateBirthDate(birthDate)) &&
      !firstNameError &&
      !lastNameError &&
      !rankError &&
      !bioError &&
      !cityError &&
      !birthDateError ? (
        <Button className="mx-auto" onClick={editProfile}>
          Готово
        </Button>
      ) : (
        <Button className="mx-auto bg-[#F8F8FA] text-[#A4A9B4]">Готово</Button>
      )}
    </div>
  );
};
