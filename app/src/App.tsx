import { useState, useEffect, useRef } from "react";
import SimpleMarkdownPage from "@/components/core/SimpleMarkdownPage";
import ResponsiveSidebar from "@/components/navigation/sidebar/CategoryNavigation";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { useTheme } from "@/components/theme/context/ThemeContext";
import ThemeSelector from "@/components/theme/selector/ThemeSelector";

function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { currentTheme, setTheme } = useTheme();

  // Load initial document (from URL or first available)
  useEffect(() => {
    const loadInitialDocument = async () => {
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
        try {
          const files = await MarkdownLoader.getAvailableFiles();
          if (files.length > 0) {
            setSelectedFile(files[0]);
          }
        } catch (err) {
          console.error("Failed to load initial document:", err);
        }
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
      {/* Clean header with just the theme selector in top right */}
      <header className="h-16 border-b sticky top-0 z-30 backdrop-blur-md bg-background/95 border-border flex items-center justify-end px-4">
        <ThemeSelector
          currentTheme={currentTheme.name}
          onThemeChange={setTheme}
        />
      </header>

      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Responsive sidebar with real data */}
        <ResponsiveSidebar
          onSelectFile={handleSelectFile}
          currentFilePath={selectedFile ?? undefined}
        />

        {/* Main content area with padding for menu button */}
        <main
          ref={mainContentRef}
          className="w-full flex-1 overflow-y-auto pt-16 md:pt-4 px-4 md:px-8"
        >
          {selectedFile ? (
            <SimpleMarkdownPage filename={selectedFile} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 max-w-md">
                <h2 className="text-xl font-medium mb-4">
                  Welcome to Documentation
                </h2>
                <p className="text-muted-foreground">
                  Select a document from the sidebar to get started.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Simple footer */}
      <footer className="border-t mt-auto py-3 px-4 border-border">
        <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground">
          <p>Documentation App</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
