import { useState, useEffect, useRef } from "react";
import CardDocumentViewer from "@/components/card/viewer/CardDocumentViewer";
import ResponsiveSidebar from "@/components/navigation/sidebar/CategoryNavigation";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { useTheme } from "@/components/theme/context/ThemeContext";
import LoadingAnimation from "@/components/init/LoadingAnimation";

function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mainContentRef = useRef<HTMLDivElement>(null);
  useTheme();

  useEffect(() => {
    const loadInitialDocument = async () => {
      const minLoadTime = new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        // Check if there's a document slug in the URL hash
        const hashParams = window.location.hash.substring(1);

        if (hashParams) {
          // If hash is present, try to find the file with this path
          const files = await MarkdownLoader.getAvailableFiles();
          const matchingFile = files.find((file) => {
            return (
              file === hashParams ||
              file === `${hashParams}.md` ||
              file.split("/").pop()?.replace(".md", "") === hashParams
            );
          });

          if (matchingFile) {
            setSelectedFile(matchingFile);
          }
        } else {
          // Try to load available files and load the first one
          const files = await MarkdownLoader.getAvailableFiles();
          if (files.length > 0) {
            setSelectedFile(files[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load initial document:", err);
      } finally {
        // Wait for minimum loading time before hiding loader
        await minLoadTime;
        setIsLoading(false);
      }
    };

    loadInitialDocument();
  }, []);

  // Handle file selection
  const handleSelectFile = (filepath: string) => {
    setSelectedFile(filepath);

    // Update URL hash
    const slug = filepath.endsWith(".md") ? filepath.slice(0, -3) : filepath;
    window.location.hash = slug;

    // Scroll to top of content area
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Show loading animation when app is initializing */}
      {isLoading && <LoadingAnimation />}

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
        />

        {/* Main content area with padding for menu button */}
        <main
          ref={mainContentRef}
          className="w-full flex-1 overflow-y-auto pt-16 md:pt-4 px-4 md:px-8"
        >
          <CardDocumentViewer
            selectedFile={selectedFile ?? ""}
            setSelectedFile={setSelectedFile}
          />
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
