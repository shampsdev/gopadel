import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import { useAuthStore } from "./shared/stores/auth.store";
import { initDataUser, useRawInitData } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import useTgUserStore from "./shared/stores/tg-user.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routes } from "./routes/routes";

const queryClient = new QueryClient();
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
  }, [initData, setToken]);

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
  }, [initUserData, avatarUrl, username, setAvatarUrl, setUsername]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />;
    </QueryClientProvider>
  );
}

export default App;
