import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import initializeApplication from "./shared/initApp.ts";

initializeApplication();

createRoot(document.getElementById("root")!).render(<App />);
