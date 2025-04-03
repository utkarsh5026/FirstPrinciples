import { useState, useEffect, useRef } from "react";
import CardDocumentViewer from "@/components/card/CardDocumentViewer";
import ResponsiveSidebar from "@/components/navigation/sidebar/CategoryNavigation";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { useTheme } from "@/components/theme/context/ThemeContext";

function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  useTheme();

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
    console.log(selectedFile);

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
      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
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
      <footer className="border-t mt-auto py-3 px-4 border-border">
        <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground">
          <p>Card View Documentation App</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
