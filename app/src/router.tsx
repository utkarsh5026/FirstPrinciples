// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./components/home/HomePage";
import DocumentPreview from "./components/card/preview/DocumentPreview";

/**
 * Application Router Configuration
 *
 * Defines the routing structure for the entire application:
 * - Root route: The main application container
 * - Home page: Shows dashboard, reading history, to-do list, and analytics
 * - Document routes: Shows document preview and fullscreen reading views
 */
const router = createBrowserRouter([
  {
    path: "/FirstPrinciples",
    element: <App />,
    children: [
      {
        path: "documents/:documentPath/*",
        element: <DocumentPreview />,
      },
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);

export default router;
