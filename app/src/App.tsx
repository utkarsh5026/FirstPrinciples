// App.tsx with Enhanced Sidebar
import { useEffect, useState, useRef } from "react";
import SimpleMarkdownPage from "./components/core/SimpleMarkdownPage";
import MarkdownManager from "./components/manager/MarkdownManager";
import EnhancedSidebar from "./components/navigation/sidebar/CategoryNavigation"; // Import the new component
import { MarkdownLoader } from "./utils/MarkdownLoader";
import { useTheme } from "./components/theme/ThemeProvider";
import ThemeSelector from "./components/theme/ThemeSelector";

// Import React Icons
import { FiBook, FiDownload, FiFolder, FiMenu, FiX } from "react-icons/fi";

type ActiveTab = "view" | "manage" | "settings";

// Import shadcn components
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function App() {
  const { currentTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>("view");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Handle responsive sidebar sizing
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track window size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarVisible(false); // Close mobile sidebar on resize to desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load initial document
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
    setActiveTab("view");

    // Update URL hash
    const slug = filepath.endsWith(".md") ? filepath.slice(0, -3) : filepath;
    window.location.hash = slug;

    // Close mobile sidebar when selecting a file
    if (isMobile) {
      setSidebarVisible(false);
    }

    // Scroll to top of content area
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  };

  // Handle downloading the current markdown
  const handleDownloadMarkdown = async () => {
    if (!selectedFile) return;

    try {
      const result = await MarkdownLoader.loadMarkdownContent(selectedFile);
      if (!result) return;

      // Prepare the content with frontmatter
      const frontmatterStr = Object.entries(result.frontmatter)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: [${value.join(", ")}]`;
          }
          return `${key}: ${value}`;
        })
        .join("\n");

      const fullContent = `---\n${frontmatterStr}\n---\n\n${result.content}`;

      // Get filename from path
      const filename = selectedFile.split("/").pop() || selectedFile;

      MarkdownLoader.downloadMarkdown(filename, fullContent);
    } catch (error) {
      console.error("Error downloading markdown:", error);
    }
  };

  // Set the tab value based on activeTab state
  const tabValue = activeTab;

  return (
    <div className="min-h-screen flex flex-col font-type-mono bg-background text-foreground">
      {/* Header */}
      <header className="border-b sticky top-0 z-30 backdrop-blur-md bg-background/95 border-border">
        <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isMobile ? (
              <Button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                variant="ghost"
                size="icon"
                className="md:hidden mr-3"
                aria-label={sidebarVisible ? "Close menu" : "Open menu"}
              >
                {sidebarVisible ? <FiX size={20} /> : <FiMenu size={20} />}
              </Button>
            ) : null}

            <h1 className="text-xl font-normal tracking-tight truncate md:mr-8 text-foreground">
              First Principles Docs
            </h1>

            {/* Desktop tab navigation */}
            <div className="hidden md:block">
              <Tabs
                value={tabValue}
                onValueChange={(value) =>
                  setActiveTab(value as "view" | "manage" | "settings")
                }
                className="w-full"
              >
                <TabsList className="bg-secondary/30">
                  <TabsTrigger value="view">
                    <FiBook className="mr-2" size={18} />
                    View Documents
                  </TabsTrigger>
                  <TabsTrigger value="manage">
                    <FiFolder className="mr-2" size={18} />
                    Manage Files
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Selector */}
            <ThemeSelector
              currentTheme={currentTheme.name}
              onThemeChange={setTheme}
            />

            {/* Download button (desktop) */}
            {selectedFile && activeTab === "view" && (
              <Button
                onClick={handleDownloadMarkdown}
                variant="outline"
                size="sm"
                className="hidden md:flex"
              >
                <FiDownload size={16} className="mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation tabs */}
      <div className="md:hidden border-b px-4 py-2 border-border bg-background">
        <Tabs
          value={tabValue}
          onValueChange={(value) =>
            setActiveTab(value as "view" | "manage" | "settings")
          }
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 h-12 rounded-md bg-secondary/30">
            <TabsTrigger value="view">
              <FiBook className="mr-2" size={16} />
              View
            </TabsTrigger>
            <TabsTrigger value="manage">
              <FiFolder className="mr-2" size={16} />
              Files
            </TabsTrigger>
            {selectedFile && (
              <TabsTrigger value="download" onClick={handleDownloadMarkdown}>
                <FiDownload className="mr-2" size={16} />
                Download
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>

      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar using Sheet component */}
        {isMobile && activeTab === "view" && (
          <Sheet open={sidebarVisible} onOpenChange={setSidebarVisible}>
            <SheetContent
              side="left"
              className="p-0 w-4/5 max-w-xs sm:max-w-sm border-r border-border"
            >
              <EnhancedSidebar
                onSelectFile={handleSelectFile}
                currentFilePath={selectedFile || undefined}
                isMobile={true}
                onClose={() => setSidebarVisible(false)}
              />
            </SheetContent>
          </Sheet>
        )}

        {/* Desktop sidebar */}
        {!isMobile && activeTab === "view" && (
          <div className="border-r overflow-y-auto bg-card border-border w-72 min-w-72 max-w-sm hidden md:block">
            <EnhancedSidebar
              onSelectFile={handleSelectFile}
              currentFilePath={selectedFile || undefined}
            />
          </div>
        )}

        {/* Main content area */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto">
          {activeTab === "view" ? (
            <>
              {selectedFile ? (
                <div className="px-4 py-4">
                  <SimpleMarkdownPage filename={selectedFile} />
                </div>
              ) : (
                <div className="p-8 rounded-lg border text-center max-w-4xl mx-auto my-6 bg-card border-border">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <FiBook size={28} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-medium mb-4 text-foreground">
                    No Document Selected
                  </h2>
                  <p className="mb-6 max-w-md mx-auto text-muted-foreground">
                    Select a document from the sidebar or browse all available
                    documents in the file manager.
                  </p>
                  <Button
                    onClick={() => setActiveTab("manage")}
                    variant="outline"
                    className="border-primary/30 bg-primary/5 hover:bg-primary/10"
                  >
                    <FiFolder className="mr-2" />
                    Browse Documents
                  </Button>
                </div>
              )}
            </>
          ) : (
            <MarkdownManager onSelectFile={handleSelectFile} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto py-4 px-4 md:py-6 border-border">
        <div className="max-w-7xl mx-auto text-center text-sm">
          <p className="text-muted-foreground">
            First Principles Documentation - GitHub Pages
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
