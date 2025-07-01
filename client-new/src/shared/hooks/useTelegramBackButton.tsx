import { useEffect } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router";

export const useTelegramBackButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (backButton.isMounted()) {
      const handleBackClick = () => {
        navigate(-1);
      };

      backButton.onClick(handleBackClick);

      return () => {
        backButton.offClick(handleBackClick);
      };
    }
  }, [navigate]);
};
