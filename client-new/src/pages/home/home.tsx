import { AnimatedOutlet } from "../../components/helpers/animated-outlet";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";

export const Home = () => {
  useTelegramBackButton({ showOnMount: false, hideOnUnmount: false });
  return (
    <>
      <AnimatedOutlet />
    </>
  );
};
