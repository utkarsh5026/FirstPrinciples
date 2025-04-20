import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { XPProvider } from "./context/xp/XpProvider.tsx";
import { RouterProvider } from "react-router-dom";
import router from "./router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <XPProvider>
      <RouterProvider router={router} />
    </XPProvider>
  </StrictMode>
);
