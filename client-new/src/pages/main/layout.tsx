import { useEffect } from "react";
import { viewport } from "@telegram-apps/sdk-react";
import { AnimatedOutlet } from "../../components/helpers/animated-outlet";
import BottomNavbar from "../../components/widgets/bottom-navbar";

export const MainLayout = () => {
  useEffect(() => {
    // Расширяем viewport на весь экран
    try {
      viewport.expand();
    } catch (error) {
      console.warn("Viewport expansion not supported:", error);
    }
  }, []);

  return (
    <div className="max-w-[90%] mx-auto">
      <AnimatedOutlet />
      <BottomNavbar />
    </div>
  );
};
