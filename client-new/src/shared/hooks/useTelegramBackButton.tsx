import { useEffect } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router";

export const useTelegramBackButton = ({
  showOnMount = true,
  hideOnUnmount = false,
}: {
  showOnMount?: boolean;
  hideOnUnmount?: boolean;
} = {}) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (showOnMount && !backButton.isVisible()) {
      backButton.show();
    } else if (!showOnMount && backButton.isVisible()) {
      backButton.hide();
    }

    return () => {
      if (hideOnUnmount && backButton.isVisible()) {
        backButton.hide();
      }
    };
  }, [showOnMount, hideOnUnmount, navigate]);
};
