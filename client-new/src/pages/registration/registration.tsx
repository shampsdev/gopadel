import { useState, useRef, useEffect } from "react";
import Logo from "../../assets/logo.png";
import useTgUserStore from "../../shared/stores/tg-user.store";
import { Input } from "../../components/ui/froms/input";
import { Textarea } from "../../components/ui/froms/textarea";
import { RankInput } from "../../components/ui/froms/rank-input";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router";
import { usePatchMe } from "../../api/hooks/mutations/patch-me";
import { uploadAvatar } from "../../api/user";
import { useAuthStore } from "../../shared/stores/auth.store";
import { ranks } from "../../shared/constants/ranking";
import { useGetBio } from "../../api/hooks/useGetBio";
import { stripHtmlTags } from "../../utils/strip-html";
import { Preloader } from "../../components/widgets/preloader";

export const Registration = () => {
  const {
    avatarUrl,
    username,
    firstName: tgFirstName,
    lastName: tgLastName,
  } = useTgUserStore();

  const { data: bioData, isLoading: isBioLoading } = useGetBio();

  const [firstName, setFirstName] = useState<string | null>(
    tgFirstName ?? null
  );
  const [lastName, setLastName] = useState<string | null>(tgLastName ?? null);
  const [rank, setRank] = useState<number | null>(0);
  const [rankInput, setRankInput] = useState<string>(
    ranks.find((r) => r.from === rank)?.title ?? ""
  );

  const handleRankChange = (rankTitle: string) => {
    setRankInput(rankTitle);
    const selectedRank = ranks.find((r) => r.title === rankTitle);
    if (selectedRank) {
      setRank(selectedRank.from);
    }
  };
  const [bio, setBio] = useState<string | null>(
    stripHtmlTags(bioData?.bio ?? "") ?? null
  );

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

  const displayAvatarUrl = previewUrl || uploadedAvatarUrl || avatarUrl;

  const patchMeMutation = usePatchMe();

  const navigate = useNavigate();

  const registration = async () => {
    try {
      let finalAvatarUrl = avatarUrl;

      if (selectedFile) {
        try {
          finalAvatarUrl = await uploadAvatar(token!, selectedFile);
          setUploadedAvatarUrl(finalAvatarUrl);
        } catch (error) {
          console.error("Ошибка загрузки аватара:", error);
          alert("Ошибка загрузки аватара");
          return;
        }
      }

      await patchMeMutation.mutateAsync({
        avatar: finalAvatarUrl!,
        bio: bio ?? "",
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        rank: rank ?? 0,
        isRegistered: true,
      });
      navigate("/");
    } catch (error) {
      alert("Уупс, что-то пошло не так");
    }
  };

  useEffect(() => {
    setBio(stripHtmlTags(bioData?.bio ?? "") ?? null);
  }, [bioData]);

  if (isBioLoading) {
    return <Preloader />;
  }

  return (
    <div className="flex flex-col just gap-11 mt-3 pb-[100px]">
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
          <p className="text-[17px]">@{username}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          onChangeFunction={setFirstName}
          title={"Имя"}
          value={firstName ?? ""}
          maxLength={100}
        />
        <Input
          onChangeFunction={setLastName}
          title={"Фамилия"}
          value={lastName ?? ""}
          maxLength={100}
        />
        <RankInput
          title="Уровень"
          value={rankInput}
          onChangeFunction={handleRankChange}
        />
        <Textarea
          onChangeFunction={setBio}
          title={"О себе"}
          value={bio ?? ""}
          maxLength={255}
        />
      </div>
      {bio?.length &&
      firstName?.length &&
      lastName?.length &&
      rankInput.length > 0 ? (
        <Button className="mx-auto" onClick={registration}>
          Готово
        </Button>
      ) : (
        <Button className="mx-auto bg-[#F8F8FA] text-[#A4A9B4]">Готово</Button>
      )}
    </div>
  );
};
