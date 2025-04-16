import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme/context/ThemeProvider.tsx";
import { XPProvider } from "./context/xp/XpProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <XPProvider>
        <App />
      </XPProvider>
    </ThemeProvider>
  </StrictMode>
);
