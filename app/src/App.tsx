// src/App.tsx
import React, { useEffect, useState } from "react";
import SimpleMarkdownPage from "./components/core/SimpleMarkdownPage";
import MarkdownManager from "./components/manager/MarkdownManager";
import { Book, FileDown, Files, Menu, X } from "lucide-react";
import { MarkdownLoader } from "./utils/MarkdownLoader";

function App() {
  const [activeTab, setActiveTab] = useState<"view" | "manage">("view");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Setup dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Load initial document (you can load from a default or from URL hash)
  useEffect(() => {
    const loadInitialDocument = async () => {
      // Check if there's a document slug in the URL hash
      const hashParams = window.location.hash.substring(1);

      if (hashParams) {
        setSelectedFile(`${hashParams}.md`);
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

  // Handle file selection from the manager
  const handleSelectFile = (filename: string) => {
    setSelectedFile(filename);
    setActiveTab("view");

    // Update URL hash without the .md extension
    const slug = filename.endsWith(".md") ? filename.slice(0, -3) : filename;

    window.location.hash = slug;
  };

  // Handle downloading the current markdown
  const handleDownloadMarkdown = async () => {
    if (!selectedFile) return;

    try {
      // Fetch the markdown file
      const response = await fetch(`/content/${selectedFile}`);
      if (!response.ok) {
        throw new Error(`Failed to load markdown file: ${selectedFile}`);
      }

      const markdownText = await response.text();

      // Create the download
      const element = document.createElement("a");
      const file = new Blob([markdownText], { type: "text/markdown" });

      element.href = URL.createObjectURL(file);
      element.download = selectedFile;

      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Error downloading markdown:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-400 font-type-mono">
      {/* Header */}
      <header className="border-b border-[#303030] sticky top-0 bg-[#1a1a1a] z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-normal tracking-tight text-gray-300 mr-8">
              First Principles Documentation
            </h1>

            {/* Desktop tab navigation */}
            <nav className="hidden md:flex space-x-6">
              <button
                className={`flex items-center py-1 border-b-2 ${
                  activeTab === "view"
                    ? "border-primary text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("view")}
              >
                <Book size={18} className="mr-2" />
                View Documents
              </button>
              <button
                className={`flex items-center py-1 border-b-2 ${
                  activeTab === "manage"
                    ? "border-primary text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("manage")}
              >
                <Files size={18} className="mr-2" />
                Manage Files
              </button>
            </nav>
          </div>

          <div className="flex items-center">
            {selectedFile && activeTab === "view" && (
              <button
                onClick={handleDownloadMarkdown}
                className="hidden md:flex items-center text-gray-400 hover:text-white mr-4"
              >
                <FileDown size={18} className="mr-2" />
                Download
              </button>
            )}

            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-300"
              aria-label="Menu"
            >
              {sidebarVisible ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {sidebarVisible && (
          <div className="md:hidden border-t border-[#252525] bg-[#1a1a1a]">
            <div className="px-4 py-3 space-y-2">
              <button
                className={`flex items-center w-full px-3 py-2 rounded ${
                  activeTab === "view"
                    ? "bg-primary/10 text-white"
                    : "text-gray-400 hover:bg-[#252525]"
                }`}
                onClick={() => {
                  setActiveTab("view");
                  setSidebarVisible(false);
                }}
              >
                <Book size={18} className="mr-2" />
                View Documents
              </button>

              <button
                className={`flex items-center w-full px-3 py-2 rounded ${
                  activeTab === "manage"
                    ? "bg-primary/10 text-white"
                    : "text-gray-400 hover:bg-[#252525]"
                }`}
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
                  className="flex items-center w-full px-3 py-2 rounded text-gray-400 hover:bg-[#252525]"
                >
                  <FileDown size={18} className="mr-2" />
                  Download Markdown
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {activeTab === "view" ? (
          <>
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-pulse text-gray-400">
                  Loading document...
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-800 p-6 rounded-md text-red-200 max-w-4xl mx-auto">
                <h2 className="text-xl font-medium mb-2">Error</h2>
                <p>{error}</p>
              </div>
            ) : selectedFile ? (
              <SimpleMarkdownPage filename={selectedFile} />
            ) : (
              <div className="bg-[#202020] p-8 rounded-md border border-[#303030] text-center max-w-4xl mx-auto">
                <h2 className="text-xl font-medium text-white mb-4">
                  No Document Selected
                </h2>
                <p className="text-gray-400 mb-6">
                  Select a document from the Manage Files tab or load one from a
                  URL.
                </p>
                <button
                  onClick={() => setActiveTab("manage")}
                  className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded"
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

      {/* Footer */}
      <footer className="border-t border-[#303030] mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>First Principles Documentation - GitHub Pages</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
