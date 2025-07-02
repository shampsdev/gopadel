import { useState, useRef } from "react";
import Logo from "../../assets/logo.png";
import useTgUserStore from "../../shared/stores/tg-user.store";
import { Input } from "../../components/ui/froms/input";
import { Textarea } from "../../components/ui/froms/textarea";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router";
import { usePatchMe } from "../../api/hooks/mutations/patch-me";

export const Registration = () => {
  const { avatarUrl, username } = useTgUserStore();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(0);
  const [rankInput, setRankInput] = useState<string>("");
  const [bio, setBio] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const displayAvatarUrl = previewUrl || avatarUrl;

  const patchMeMutation = usePatchMe();

  const navigate = useNavigate();

  const registration = async () => {
    try {
      await patchMeMutation.mutateAsync({
        avatar: displayAvatarUrl!,
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
        <Input
          title="Ранг"
          value={rankInput}
          maxLength={4}
          onChangeFunction={(raw) => {
            const sanitized = raw.replace(",", ".");

            if (!/^\d*\.?\d*$/.test(sanitized)) return;

            setRankInput(raw);

            if (/^\d+(\.\d+)?$/.test(sanitized)) {
              setRank(parseFloat(sanitized));
            } else {
              setRank(null);
            }
          }}
          onBlur={() => {
            const cleaned = rankInput.replace(",", ".").trim();

            if (/^\d+(\.\d+)?$/.test(cleaned)) {
              const num = parseFloat(cleaned);
              setRank(num);
              setRankInput(String(num));
            } else {
              setRank(null);
              setRankInput("");
            }
          }}
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
