import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import AboutImage from "../../assets/about.png";

export function AboutSecond() {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  return (
    <div className="flex flex-col h-screen w-full justify-between">
      <div className="flex-1 flex flex-col text-center items-center justify-center gap-11">
        <img src={AboutImage} className="object-cover w-[70%]" />
        <div className="font-semibold text-[20px]">
          Играем в компании талантливых, продвинутых и интересных людей
        </div>
      </div>
      <Link to="../policy" className="mx-auto">
        <Button className="mb-10">Зарегистрироваться</Button>{" "}
      </Link>
    </div>
  );
}
