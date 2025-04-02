import { useEffect, useState } from "react";
import SimpleMarkdownPage from "./components/core/SimpleMarkdownPage";
import MarkdownManager from "./components/manager/MarkdownManager";
import CategoryNavigation from "./components/navigation/sidebar/CategoryNavigation";
import { MarkdownLoader } from "./utils/MarkdownLoader";
import { useTheme } from "./components/theme/ThemeProvider";
import ThemeSelector from "./components/theme/ThemeSelector";

// Import React Icons
import { FiBook, FiDownload, FiFolder, FiMenu, FiX } from "react-icons/fi";

type ActiveTab = "view" | "manage" | "settings";

// Import shadcn components
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

function App() {
  const { currentTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>("view");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarWidth = localStorage.getItem("sidebarWidth") ?? "280px";

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarVisible && window.innerWidth < 768) {
        const sidebar = document.getElementById("mobile-sidebar");
        const menuButton = document.getElementById("mobile-menu-button");

        if (
          sidebar &&
          menuButton &&
          !sidebar.contains(e.target as Node) &&
          !menuButton.contains(e.target as Node)
        ) {
          setSidebarVisible(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarVisible]);

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
    if (window.innerWidth < 768) {
      setSidebarVisible(false);
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
            <Button
              id="mobile-menu-button"
              onClick={() => setSidebarVisible(!sidebarVisible)}
              variant="ghost"
              size="icon"
              className="md:hidden mr-3"
              aria-label={sidebarVisible ? "Close menu" : "Open menu"}
            >
              {sidebarVisible ? <FiX size={20} /> : <FiMenu size={20} />}
            </Button>

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
        {/* Backdrop overlay for mobile sidebar */}
        {sidebarVisible && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
            onClick={() => setSidebarVisible(false)}
          />
        )}

        {/* Sidebar (desktop) */}
        {activeTab === "view" && (
          <div
            className="hidden md:block border-r overflow-y-auto bg-card border-border"
            style={{
              width: sidebarWidth,
              minWidth: "200px",
              maxWidth: "400px",
            }}
          >
            <div className="p-4">
              <CategoryNavigation
                onSelectFile={handleSelectFile}
                currentFilePath={selectedFile || undefined}
              />
            </div>
          </div>
        )}

        {/* Mobile sidebar */}
        {activeTab === "view" && (
          <div
            id="mobile-sidebar"
            className="fixed top-0 bottom-0 left-0 z-40 md:hidden border-r overflow-y-auto transition-transform duration-300 ease-in-out bg-card border-border"
            style={{
              width: "280px",
              paddingTop: "6rem",
              transform: sidebarVisible ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            <div className="p-4">
              <CategoryNavigation
                onSelectFile={handleSelectFile}
                currentFilePath={selectedFile || undefined}
              />
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
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
