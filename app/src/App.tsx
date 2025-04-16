import { useState, useRef } from "react";
import ResponsiveSidebar from "@/components/navigation/sidebar/CategoryNavigation";
import LoadingAnimation from "@/components/init/LoadingAnimation";
import HomePage from "@/components/home/HomePage";
import AppHeader from "@/components/layout/AppHeader";
import AppWrapper from "@/components/welcome/Wrapper";
import { TabProvider } from "@/components/home/context/TabProvider";
import DocumentPreview from "@/components/card/preview/DocumentPreview";
import { useInit } from "./stores";

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
 * - Supports URL hash-based navigation
 *
 * 🔄 Flow:
 * 1. Shows loading animation on startup
 * 2. Loads available documents in background
 * 3. Renders either homepage or document preview based on user selection
 * 4. Maintains navigation state and URL synchronization
 */
export const App = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showHomePage, setShowHomePage] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const loading = useInit();

  /* 
  📝 Handle file selection
   */
  const handleSelectFile = (filepath: string) => {
    setSelectedFile(filepath);
    setShowHomePage(false);

    // Update URL hash
    const slug = filepath.endsWith(".md") ? filepath.slice(0, -3) : filepath;
    window.location.hash = slug;

    // Scroll to top of content area
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }

    // Close sidebar on mobile when selecting a file
    setSidebarOpen(false);
  };

  /* 
  🏠 Handle navigation to home
   */
  const navigateToHome = () => {
    setSelectedFile(null);
    setShowHomePage(true);
    window.location.hash = "";

    setSidebarOpen(false);
  };

  /* 
    🔄 Toggle sidebar visibility
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppWrapper>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {loading && <LoadingAnimation />}

        {/* App Header */}
        {!loading && (
          <AppHeader
            toggleSidebar={toggleSidebar}
            onNavigateHome={navigateToHome}
            className="transition-opacity duration-500"
          />
        )}

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
            currentFilePath={selectedFile ?? undefined}
            onNavigateHome={navigateToHome}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          {/* Main content area with padding for header */}
          <main
            ref={mainContentRef}
            className="w-full flex-1 overflow-y-auto pt-16 md:pt-16 px-4 md:px-8"
          >
            {showHomePage ? (
              <TabProvider>
                <HomePage onSelectFile={handleSelectFile} />
              </TabProvider>
            ) : (
              <DocumentPreview selectedFileUrl={selectedFile ?? ""} />
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
