import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import AboutImage from "../../assets/about.png";
export function AboutFirst() {
  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex-1 flex flex-col text-center items-center justify-center gap-11">
        <img src={AboutImage} className="object-cover w-[70%]" />
        <div className="text-[#5D6674] text-[20px]">
          <b className="text-black">GoPadel</b> — приложение для организации
          турниров и игр в падел
        </div>
      </div>
      <div className="mt-auto mx-auto pb-10">
        <Link to="second">
          <Button className="mx-auto">Дальше</Button>
        </Link>
      </div>
    </div>
  );
}
