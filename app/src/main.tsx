import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/theme/context/ThemeProvider.tsx";
import { ServicesProvider } from "./context/services/ServiceProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ServicesProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ServicesProvider>
  </StrictMode>
);
