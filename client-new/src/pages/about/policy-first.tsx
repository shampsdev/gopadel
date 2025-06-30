import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import AboutImage from "../../assets/about.png";

export function PolicyFirst() {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const navigate = useNavigate();

  const register = () => {
    console.log("register");
  };
  return (
    <div className="flex flex-col h-full w-full justify-between">
      <div className="flex-1 flex flex-col text-center items-center justify-center gap-11">
        <img src={AboutImage} className="object-cover w-[70%] opacity-0" />
        <div className="flex flex-col gap-4">
          <div className="font-semibold text-[20px]">
            Небольшая формальность прежде, чем мы начнём
          </div>
          <div className="text-[#868D98]">
            выбирая вариант «Принимаю»,вы соглашаетесь с положениями{" "}
            <a
              onClick={() => {
                navigate("./read");
              }}
              className="font-semibold underline cursor-pointer"
            >
              политики конфиденциальности
            </a>
          </div>
        </div>
      </div>
      <div className="mb-10 flex flex-row gap-4 justify-center">
        <Button className="bg-[#F8F8FA]" onClick={() => navigate("./decline")}>
          Отмена
        </Button>
        <Button
          onClick={() => {
            register();
            navigate("/registration");
          }}
        >
          Принимаю
        </Button>
      </div>
    </div>
  );
}
