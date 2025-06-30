import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { init } from "@telegram-apps/sdk-react";
import "./index.css";
import App from "./App.tsx";

init();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
