import { useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import ResponsiveSidebar from "@/components/navigation/ResponsiveSidebar";
import LoadingAnimation from "@/components/utils/init/LoadingAnimation";
import AppHeader from "@/components/layout/AppHeader";
import AppWrapper from "@/components/utils/welcome/Wrapper";
import { TabProvider } from "@/components/home/context/TabProvider";
import { useInit } from "./stores";
import { useTheme } from "@/hooks/ui/use-theme";

/**
 * 🌟 App Component
 *
 * The main application component that orchestrates the entire user experience.
 * It manages document selection, navigation, and UI state transitions.
 *
 * ✨ Features:
 * - Loads and displays markdown documents
 * - Handles navigation between home and document views
 * - Manages responsive sidebar for easy document browsing
 * - Provides smooth loading transitions
 * - Supports URL-based navigation through React Router
 */
export const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  useTheme();

  const loading = useInit();

  console.log("Welcome to the app ❤️");

  /* 
  📝 Handle file selection
   */
  const handleSelectFile = (filepath: string) => {
    const encodedPath = encodeURIComponent(filepath.replace(".md", ""));
    navigate(`/documents/${encodedPath}`);

    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }

    setSidebarOpen(false);
  };

  /* 
  🏠 Handle navigation to home
   */
  const navigateToHome = () => {
    navigate("/");
    setSidebarOpen(false);
  };

  /* 
    🔄 Toggle sidebar visibility
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isHomePage = location.pathname === "/";

  return (
    <AppWrapper>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {loading && <LoadingAnimation />}

        <AppHeader
          toggleSidebar={toggleSidebar}
          onNavigateHome={navigateToHome}
          className="transition-opacity duration-500"
        />

        {/* Main content with sidebar */}
        <div
          className={`flex flex-1 overflow-hidden relative ${
            loading
              ? "opacity-0"
              : "opacity-100 transition-opacity duration-500"
          }`}
        >
          {/* Responsive sidebar with category navigation */}
          <ResponsiveSidebar
            onSelectFile={handleSelectFile}
            currentFilePath={
              location.pathname.startsWith("/documents/")
                ? decodeURIComponent(
                    location.pathname.split("/documents/")[1]?.split("/")[0]
                  )
                : undefined
            }
            onNavigateHome={navigateToHome}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          {/* Main content area with padding for header */}
          <main
            ref={mainContentRef}
            className="w-full flex-1 overflow-y-auto pt-16 md:pt-16 px-4 md:px-8"
          >
            {isHomePage ? (
              <TabProvider>
                <Outlet />
              </TabProvider>
            ) : (
              <Outlet />
            )}
          </main>
        </div>

        {/* Simple footer */}
        <footer
          className={`border-t mt-auto py-3 px-4 border-border font-cascadia-code ${
            loading
              ? "opacity-0"
              : "opacity-100 transition-opacity duration-500"
          }`}
        >
          <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground">
            <p>
              Made with ❤️ by{" "}
              <a
                href="https://github.com/utkarsh5026"
                target="_blank"
                rel="noopener noreferrer"
              >
                Utkarsh Priyadarshi
              </a>
            </p>
          </div>
        </footer>
      </div>
    </AppWrapper>
  );
};

export default App;
