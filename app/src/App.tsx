// src/App.tsx
import React, { useEffect, useState } from "react";
import SimpleMarkdownPage from "./components/core/SimpleMarkdownPage";
import MarkdownManager from "./components/manager/MarkdownManager";
import CategoryNavigation from "./components/navigation/CategoryNavigation";
import BreadcrumbNav from "./components/navigation/BreadCrumbNav";
import { Book, FileDown, Files, Menu, X, Moon, Sun } from "lucide-react";
import { MarkdownLoader } from "./utils/MarkdownLoader";
import { cn } from "@/lib/utils";

function App() {
  const [activeTab, setActiveTab] = useState<"view" | "manage" | "settings">(
    "view"
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    // Get saved sidebar width or default to 280px
    return localStorage.getItem("sidebarWidth") || "280px";
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Setup dark mode based on saved preference or default
  useEffect(() => {
    const darkModePreference = localStorage.getItem("darkMode");
    const prefersDark =
      darkModePreference === "true" || darkModePreference === null;
    setIsDarkMode(prefersDark);

    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem("darkMode", String(newValue));

    if (newValue) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Load initial document
  useEffect(() => {
    const loadInitialDocument = async () => {
      // Check if there's a document slug in the URL hash
      const hashParams = window.location.hash.substring(1);

      if (hashParams) {
        // If hash is present, try to find the file with this path
        const files = await MarkdownLoader.getAvailableFiles();
        const matchingFile = files.find((file) => {
          // Match either the full path or the path without .md extension
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

    // Update URL hash (use the filepath without extension for cleaner URLs)
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

  // Handle category navigation
  const handleCategoryNav = (categoryId: string) => {
    // Navigate to home/root if categoryId is "root"
    if (categoryId === "root") {
      // Could implement showing all root files or a welcome page
      return;
    }

    // Otherwise, this could expand the category in the navigation
    // This would be handled by the CategoryNavigation component internally
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col font-type-mono",
        isDarkMode ? "bg-[#1a1a1a] text-gray-300" : "bg-white text-gray-800"
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "border-b sticky top-0 z-10",
          isDarkMode
            ? "border-[#303030] bg-[#1a1a1a]"
            : "border-gray-200 bg-white"
        )}
      >
        <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1
              className={cn(
                "text-xl font-normal tracking-tight mr-8",
                isDarkMode ? "text-gray-300" : "text-gray-800"
              )}
            >
              First Principles Documentation
            </h1>

            {/* Desktop tab navigation */}
            <nav className="hidden md:flex space-x-6">
              <button
                className={cn(
                  "flex items-center py-1 border-b-2",
                  activeTab === "view"
                    ? isDarkMode
                      ? "border-primary text-white"
                      : "border-primary text-gray-900"
                    : isDarkMode
                    ? "border-transparent text-gray-500 hover:text-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                )}
                onClick={() => setActiveTab("view")}
              >
                <Book size={18} className="mr-2" />
                View Documents
              </button>
              <button
                className={cn(
                  "flex items-center py-1 border-b-2",
                  activeTab === "manage"
                    ? isDarkMode
                      ? "border-primary text-white"
                      : "border-primary text-gray-900"
                    : isDarkMode
                    ? "border-transparent text-gray-500 hover:text-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                )}
                onClick={() => setActiveTab("manage")}
              >
                <Files size={18} className="mr-2" />
                Manage Files
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={cn(
                "p-2 rounded-md",
                isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-[#252525]"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              )}
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Download button (desktop) */}
            {selectedFile && activeTab === "view" && (
              <button
                onClick={handleDownloadMarkdown}
                className={cn(
                  "hidden md:flex items-center",
                  isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <FileDown size={18} className="mr-2" />
                Download
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className={cn(
                "md:hidden p-2",
                isDarkMode
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
              )}
              aria-label="Menu"
            >
              {sidebarVisible ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {sidebarVisible && (
          <div
            className={cn(
              "md:hidden border-t",
              isDarkMode
                ? "border-[#252525] bg-[#1a1a1a]"
                : "border-gray-200 bg-white"
            )}
          >
            <div className="px-4 py-3 space-y-2">
              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded",
                  activeTab === "view"
                    ? isDarkMode
                      ? "bg-primary/10 text-white"
                      : "bg-primary/10 text-gray-900"
                    : isDarkMode
                    ? "text-gray-400 hover:bg-[#252525]"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => {
                  setActiveTab("view");
                  setSidebarVisible(false);
                }}
              >
                <Book size={18} className="mr-2" />
                View Documents
              </button>

              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded",
                  activeTab === "manage"
                    ? isDarkMode
                      ? "bg-primary/10 text-white"
                      : "bg-primary/10 text-gray-900"
                    : isDarkMode
                    ? "text-gray-400 hover:bg-[#252525]"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => {
                  setActiveTab("manage");
                  setSidebarVisible(false);
                }}
              >
                <Files size={18} className="mr-2" />
                Manage Files
              </button>

              {selectedFile && activeTab === "view" && (
                <button
                  onClick={handleDownloadMarkdown}
                  className={cn(
                    "flex items-center w-full px-3 py-2 rounded",
                    isDarkMode
                      ? "text-gray-400 hover:bg-[#252525]"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <FileDown size={18} className="mr-2" />
                  Download Markdown
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop) */}
        {activeTab === "view" && (
          <div
            className={cn(
              "hidden md:block border-r overflow-y-auto",
              isDarkMode ? "border-[#303030]" : "border-gray-200"
            )}
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

        {/* Mobile sidebar (shown when sidebar is visible) */}
        {activeTab === "view" && sidebarVisible && (
          <div
            className={cn(
              "absolute top-[57px] bottom-0 left-0 z-50 md:hidden border-r overflow-y-auto",
              isDarkMode
                ? "bg-[#1a1a1a] border-[#303030]"
                : "bg-white border-gray-200"
            )}
            style={{ width: "280px" }}
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
              {loading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <div
                    className={cn(
                      "animate-pulse",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    Loading document...
                  </div>
                </div>
              ) : error ? (
                <div
                  className={cn(
                    "p-6 rounded-md max-w-4xl mx-auto my-6",
                    isDarkMode
                      ? "bg-red-900/20 border border-red-800 text-red-200"
                      : "bg-red-50 border border-red-200 text-red-800"
                  )}
                >
                  <h2 className="text-xl font-medium mb-2">Error</h2>
                  <p>{error}</p>
                </div>
              ) : selectedFile ? (
                <div className="p-4">
                  {/* Breadcrumb navigation */}
                  <BreadcrumbNav
                    filePath={selectedFile}
                    className="mb-4"
                    onNavigate={handleCategoryNav}
                  />

                  {/* Document content */}
                  <SimpleMarkdownPage filename={selectedFile} />
                </div>
              ) : (
                <div
                  className={cn(
                    "p-8 rounded-md border text-center max-w-4xl mx-auto my-6",
                    isDarkMode
                      ? "bg-[#202020] border-[#303030]"
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <h2
                    className={cn(
                      "text-xl font-medium mb-4",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}
                  >
                    No Document Selected
                  </h2>
                  <p
                    className={cn(
                      "mb-6",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Select a document from the sidebar or browse all available
                    documents.
                  </p>
                  <button
                    onClick={() => setActiveTab("manage")}
                    className={cn(
                      "px-4 py-2 rounded",
                      isDarkMode
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-primary/10 text-primary border border-primary/30"
                    )}
                  >
                    Browse Documents
                  </button>
                </div>
              )}
            </>
          ) : (
            <MarkdownManager onSelectFile={handleSelectFile} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer
        className={cn(
          "border-t mt-auto py-6",
          isDarkMode ? "border-[#303030]" : "border-gray-200"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p className={isDarkMode ? "text-gray-500" : "text-gray-600"}>
            First Principles Documentation - GitHub Pages
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
