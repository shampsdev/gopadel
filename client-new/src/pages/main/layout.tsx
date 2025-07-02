import { AnimatedOutlet } from "../../components/helpers/animated-outlet";
import BottomNavbar from "../../components/widgets/bottom-navbar";

export const MainLayout = () => {
  return (
    <div className="max-w-[90%] mx-auto">
      <AnimatedOutlet />
      <BottomNavbar />
    </div>
  );
};
