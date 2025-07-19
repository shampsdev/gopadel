import { Outlet } from "react-router";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";

export const Home = () => {
  useTelegramBackButton({ showOnMount: false, hideOnUnmount: false });
  return (
    <>
      <Outlet />
    </>
  );
};
