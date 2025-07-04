import { backButton, init, initData, miniApp } from "@telegram-apps/sdk-react";

const initializeApplication = async () => {
  initData.restore();
  init();
  if (backButton.mount.isAvailable()) {
    backButton.mount();
  }
  if (miniApp.mount.isAvailable()) {
    try {
      const promise = miniApp.mount();
      await promise;
      if (miniApp.ready.isAvailable()) miniApp.ready();
      if (miniApp.setBackgroundColor.isAvailable())
        miniApp.setBackgroundColor("#FFFFFF");
      if (miniApp.setHeaderColor.isAvailable())
        miniApp.setHeaderColor("#FFFFFF");
    } catch (err) {
      console.error("MiniApp mount failed:", err);
    }
  }
};

export default initializeApplication;
