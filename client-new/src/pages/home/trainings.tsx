import { Link } from "react-router";
import AboutImage from "../../assets/about.png";
import { Button } from "../../components/ui/button";
import { HomeNavbar } from "../../components/widgets/home-navbar";
export const Trainings = () => {
  return (
    <>
      <HomeNavbar />
      <div className="flex flex-col mt-[40px] w-full">
        <div className="flex flex-col text-center items-center justify-center gap-11 flex-grow  h-full">
          <img src={AboutImage} className="object-cover w-[70%]" />

          <div className="mt-auto">
            <div className="text-black text-[20px]">Coming soon</div>
            <Link to="../">
              <Button className="mx-auto mt-[20px]">Назад</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
