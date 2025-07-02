import { HomeNavbar } from "../../components/widgets/home-navbar";
import { AnimatedOutlet } from "../../components/helpers/animated-outlet";

export const Home = () => {
  return (
    <>
      <HomeNavbar />
      <AnimatedOutlet />
    </>
  );
};
