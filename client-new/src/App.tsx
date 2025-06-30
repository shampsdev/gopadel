import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import { routes } from "./shared/routes/routes";
import { useAuthStore } from "./shared/stores/auth.store";
import { useRawInitData } from "@telegram-apps/sdk-react";
import { useEffect } from "react";

const router = createBrowserRouter(routes);

function App() {
  const { setToken } = useAuthStore();
  const initData = useRawInitData();
  useEffect(() => {
    if (initData) setToken(initData);
  }, [initData]);

  return <RouterProvider router={router} />;
}

export default App;
