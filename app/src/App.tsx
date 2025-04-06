// src/App.tsx
import { useState, useEffect, useRef } from "react";
import CardDocumentViewer from "@/components/card/viewer/CardDocumentViewer";
import ResponsiveSidebar from "@/components/navigation/sidebar/CategoryNavigation";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { useTheme } from "@/components/theme/context/ThemeContext";
import LoadingAnimation from "@/components/init/LoadingAnimation";
import HomePage from "@/components/home/HomePage";
import AppHeader from "@/components/layout/AppHeader";
import { ReadingAnalyticsService } from "@/utils/ReadingAnalyticsService";

function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHomePage, setShowHomePage] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  useTheme();

  // Load available documents and initialize analytics
  useEffect(() => {
    const initializeApp = async () => {
      const minLoadTime = new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        // Load all available documents first
        const files = await MarkdownLoader.getAvailableFiles();
        const fileMetadata = [];

        // Get metadata for each file
        for (const file of files) {
          const metadata = await MarkdownLoader.findFileMetadata(file);
          if (metadata) {
            fileMetadata.push(metadata);
          }
        }

        // Initialize the analytics service with available documents
        ReadingAnalyticsService.setAvailableDocuments(fileMetadata);

        // Check if there's a document slug in the URL hash
        const hashParams = window.location.hash.substring(1);

        if (hashParams) {
          // If hash is present, try to find the file with this path
          const matchingFile = files.find((file) => {
            return (
              file === hashParams ||
              file === `${hashParams}.md` ||
              file.split("/").pop()?.replace(".md", "") === hashParams
            );
          });

          if (matchingFile) {
            setSelectedFile(matchingFile);
            setShowHomePage(false);
          }
        }
      } catch (err) {
        console.error("Failed to initialize app:", err);
      } finally {
        // Wait for minimum loading time before hiding loader
        await minLoadTime;
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle file selection
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

  // Handle navigation to home
  const navigateToHome = () => {
    setSelectedFile(null);
    setShowHomePage(true);
    window.location.hash = "";

    // Close sidebar on mobile when navigating home
    setSidebarOpen(false);
  };

  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Show loading animation when app is initializing */}
      {isLoading && <LoadingAnimation />}

      {/* App Header */}
      {!isLoading && (
        <AppHeader
          toggleSidebar={toggleSidebar}
          onNavigateHome={navigateToHome}
          className="transition-opacity duration-500"
        />
      )}

      {/* Main content with sidebar */}
      <div
        className={`flex flex-1 overflow-hidden relative ${
          isLoading
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
            <HomePage onSelectFile={handleSelectFile} />
          ) : (
            <CardDocumentViewer
              selectedFile={selectedFile ?? ""}
              setSelectedFile={handleSelectFile}
            />
          )}
        </main>
      </div>

      {/* Simple footer */}
      <footer
        className={`border-t mt-auto py-3 px-4 border-border font-cascadia-code ${
          isLoading
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
  );
}

export default App;
