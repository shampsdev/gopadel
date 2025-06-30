import { useState } from "react";
import Logo from "../../assets/logo.png";
import useTgUserStore from "../../shared/stores/tg-user.store";
import { Input } from "../../components/ui/froms/input";

export const Registration = () => {
  const { avatarUrl, username } = useTgUserStore();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(0);
  const [rankInput, setRankInput] = useState<string>("");
  return (
    <div className="flex flex-col gap-11 mt-3">
      <div className="flex flex-row gap-7 items-center">
        <div className="aspect-square max-h-20 rounded-full overflow-hidden">
          <img src={avatarUrl} className="object-cover" />
        </div>
        <div className="flex flex-col w-full gap-2 ">
          <img src={Logo} className="max-w-[140px]" />
          <p className="text-[17px]">@{username}</p>
        </div>
      </div>

      <div>
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
      </div>
    </div>
  );
};
