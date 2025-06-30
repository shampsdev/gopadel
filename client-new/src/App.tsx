import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import { routes } from "./shared/routes/routes";
import { useAuthStore } from "./shared/stores/auth.store";
import { initDataUser, useRawInitData } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import useTgUserStore from "./shared/stores/tg-user.store";

const router = createBrowserRouter(routes);

function App() {
  const { setToken } = useAuthStore();
  const { setAvatarUrl, setUsername, avatarUrl, username } = useTgUserStore();
  const initData = useRawInitData();
  const initUserData = initDataUser();

  useEffect(() => {
    if (initData) {
      setToken(initData);
    }
  }, [initData]);

  useEffect(() => {
    if (initUserData?.photo_url) {
      if (avatarUrl === undefined) {
        setAvatarUrl(initUserData.photo_url);
      }
    }

    if (initUserData?.username) {
      if (username === undefined) {
        setUsername(initUserData.username);
      }
    }
  }, [initUserData]);

  return <RouterProvider router={router} />;
}

export default App;
