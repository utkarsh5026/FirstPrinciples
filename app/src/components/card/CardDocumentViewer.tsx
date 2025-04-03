import React, { useState, useEffect, useRef } from "react";
import { Category, MarkdownLoader } from "@/utils/MarkdownLoader";
import { useMarkdownProcessor } from "@/hooks/useMarkdownProcessor";
import { useTheme } from "@/components/theme/context/ThemeContext";
import LoadingScreen from "@/components/core/LoadingScreen";
import BreadcrumbNav from "@/components/navigation/BreadCrumbNav";
import MarkdownCardView from "@/components/card/MarkdownCardView";
import FullScreenCardView from "@/components/card/fullscreen/FullScreenCardView";
import ThemeSelector from "@/components/theme/selector/ThemeSelector";
import { Button } from "@/components/ui/button";
import {
  Download,
  Share,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useMobile from "@/hooks/useMobile";

const CardDocumentViewer = () => {
  // App state
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prevNext, setPrevNext] = useState<{ prev?: string; next?: string }>(
    {}
  );

  // Refs
  const contentRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { currentTheme, setTheme } = useTheme();
  useMobile();

  // Process markdown content
  const { parsedSections } = useMarkdownProcessor(markdownContent);

  // Load initial document from URL hash or first available
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

  // Load document content when file changes
  useEffect(() => {
    const loadMarkdown = async () => {
      if (!selectedFile) return;

      setLoading(true);
      setError(null);

      try {
        // Load markdown content
        const result = await MarkdownLoader.loadMarkdownContent(selectedFile);

        if (!result) {
          setError("Document not found");
          setLoading(false);
          return;
        }

        setMarkdownContent(result.content);

        // Find prev/next documents
        await findPrevNextDocuments(selectedFile);
      } catch (err) {
        console.error("Failed to load markdown:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [selectedFile]);

  // Find previous and next documents in the same category
  const findPrevNextDocuments = async (currentPath: string) => {
    try {
      // Get the file's breadcrumbs to determine its category
      const breadcrumbs = await MarkdownLoader.getFileBreadcrumbs(currentPath);

      if (breadcrumbs.length === 0) {
        // It's a root file, try to find prev/next among other root files
        const index = await MarkdownLoader.loadContentIndex();
        const rootFiles = index.files || [];

        if (rootFiles.length <= 1) return;

        const currentIndex = rootFiles.findIndex(
          (file) => file.path === currentPath
        );
        if (currentIndex === -1) return;

        const prev =
          currentIndex > 0 ? rootFiles[currentIndex - 1].path : undefined;
        const next =
          currentIndex < rootFiles.length - 1
            ? rootFiles[currentIndex + 1].path
            : undefined;

        setPrevNext({ prev, next });
        return;
      }

      // It's in a category, find siblings
      const lastCategoryId = breadcrumbs[breadcrumbs.length - 1].id;
      const allCategories = await MarkdownLoader.getCategories();

      // Find the category that contains this file
      const findCategory = (
        categories: Category[],
        targetId: string
      ): Category | null => {
        for (const category of categories) {
          if (category.id === targetId) {
            return category;
          }
          if (category.subcategories) {
            const found = findCategory(category.subcategories, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const category = findCategory(allCategories, lastCategoryId);
      if (!category?.files || category.files.length <= 1) return;

      // Find current file position
      const files = category.files;
      const currentIndex = files.findIndex(
        (file: { path: string }) => file.path === currentPath
      );
      if (currentIndex === -1) return;

      const prev = currentIndex > 0 ? files[currentIndex - 1].path : undefined;
      const next =
        currentIndex < files.length - 1
          ? files[currentIndex + 1].path
          : undefined;

      setPrevNext({ prev, next });
    } catch (error) {
      console.error("Error finding prev/next documents:", error);
    }
  };

  // Handle file selection (for navigation)
  const handleSelectFile = (filepath: string) => {
    setSelectedFile(filepath);

    // Update URL hash
    const slug = filepath.endsWith(".md") ? filepath.slice(0, -3) : filepath;
    window.location.hash = slug;

    // Scroll to top of content area
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  // Handle document download
  const handleDownload = () => {
    if (!selectedFile || !markdownContent) return;

    // Create the filename for download
    const downloadFilename = selectedFile.split("/").pop() || selectedFile;
    MarkdownLoader.downloadMarkdown(downloadFilename, markdownContent);
  };

  // Handle sharing the document
  const handleCopyLink = () => {
    if (!selectedFile) return;

    // Get the current URL and add the hash
    const slug = selectedFile.endsWith(".md")
      ? selectedFile.slice(0, -3)
      : selectedFile;
    const url = `${window.location.origin}${window.location.pathname}#${slug}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render fullscreen card view
  if (isFullscreen) {
    return (
      <FullScreenCardView
        markdown={markdownContent}
        onExit={() => setIsFullscreen(false)}
        parsedSections={parsedSections}
      />
    );
  }

  // Render loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="bg-red-900/10 border border-red-800/30 text-red-600 p-4 rounded-lg max-w-md">
          <h3 className="font-medium mb-2">Error Loading Document</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // If no file is selected yet, show welcome screen
  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-xl font-medium mb-4">
            Welcome to Card View Documentation
          </h2>
          <p className="text-muted-foreground">
            Select a document from the sidebar to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-4xl">
      {/* Breadcrumb navigation */}
      <div className="mb-4 font-type-mono">
        <BreadcrumbNav
          filePath={selectedFile}
          className="px-2 sm:px-0"
          onNavigate={handleSelectFile}
        />
      </div>

      {/* Main content */}
      <div className="relative" ref={contentRef}>
        <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
          {/* Document header with title and actions */}
          <div className="px-4 sm:px-6 py-4 border-b border-border/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-type-mono">
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex gap-2 font-cascadia-code">
                {/* Theme selector button */}
                <ThemeSelector
                  currentTheme={currentTheme.name}
                  onThemeChange={setTheme}
                />

                {/* Fullscreen button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 sm:w-auto sm:px-3 rounded-full sm:rounded-md"
                  title="Fullscreen mode"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1.5">Fullscreen</span>
                </Button>

                {/* Download button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 w-8 sm:w-auto sm:px-3 rounded-full sm:rounded-md"
                  title="Download document"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1.5">Download</span>
                </Button>

                {/* Share button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-8 w-8 sm:w-auto sm:px-3 rounded-full sm:rounded-md relative"
                  title="Copy link to document"
                >
                  <Share className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1.5">
                    {copied ? "Copied!" : "Share"}
                  </span>
                  {copied && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      ✓
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Card view content */}
          <div className="p-4 sm:p-6">
            <MarkdownCardView
              markdown={markdownContent}
              parsedSections={parsedSections}
            />
          </div>

          {/* Navigation between documents */}
          {(prevNext.prev || prevNext.next) && (
            <div className="border-t border-border/30 mt-4 p-4 font-type-mono">
              <div className="flex justify-between items-center">
                {prevNext.prev ? (
                  <button
                    onClick={() => handleSelectFile(prevNext.prev!)}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md hover:bg-secondary/20 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    <span className="font-cascadia-code">Previous</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {prevNext.next && (
                  <button
                    onClick={() => handleSelectFile(prevNext.next!)}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md hover:bg-secondary/20 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDocumentViewer;
