// src/components/core/SimpleMarkdownPage.tsx
import React, { useEffect, useState, useRef } from "react";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import MarkdownCardView from "@/components/card/MarkdownCardView";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import {
  FileDown,
  Share2,
  ChevronLeft,
  ChevronRight,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TOCItem } from "@/components/markdown/toc/TableOfContents";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import TableOfContentsSheet from "@/components/core/TableOfContentsSheet";
import TableOfContentsButton from "@/components/core/TableOfContentsButton";
import ViewToggle, { type ViewMode } from "@/components/card/ViewToggle";
import { type Category } from "@/utils/MarkdownLoader";
import { Button } from "@/components/ui/button";

interface SimpleMarkdownPageProps {
  filename: string;
}

const SimpleMarkdownPage: React.FC<SimpleMarkdownPageProps> = ({
  filename,
}) => {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [prevNext, setPrevNext] = useState<{ prev?: string; next?: string }>(
    {}
  );
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [tocSheetOpen, setTocSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("standard");
  const contentRef = useRef<HTMLDivElement>(null);

  // Set up swipe gestures for mobile in standard view
  const { pauseListening, resumeListening } = useSwipeGesture({
    targetRef: contentRef as React.RefObject<HTMLElement>,
    onSwipeLeft: () => setTocSheetOpen(true),
    onDoubleTap: () => setTocSheetOpen(true),
  });

  // Check dark mode
  useEffect(() => {
    const darkModePreference = localStorage.getItem("darkMode");
    const prefersDark =
      darkModePreference === "true" || darkModePreference === null;
    setIsDarkMode(prefersDark);
  }, []);

  // Check for user's preferred view mode
  useEffect(() => {
    const savedMode = localStorage.getItem(
      "preferredViewMode"
    ) as ViewMode | null;
    if (savedMode && (savedMode === "standard" || savedMode === "cards")) {
      setViewMode(savedMode);
    }
  }, []);

  useEffect(() => {
    const loadMarkdown = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load markdown content directly
        const result = await MarkdownLoader.loadMarkdownContent(filename);

        if (!result) {
          setError("Document not found");
          setLoading(false);
          return;
        }

        setMarkdownContent(result.content);

        // Generate table of contents from headings
        const headings = MarkdownLoader.extractHeadingsFromMarkdown(
          result.content
        );
        setTocItems(
          headings.map((h) => ({
            id: h.id,
            content: h.text,
            level: h.level,
            indent: (h.level - 1) * 16,
          }))
        );

        // Try to find prev/next documents based on the current file's location
        await findPrevNextDocuments(filename);
      } catch (err) {
        console.error("Failed to load markdown:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [filename]);

  // Find previous and next documents within the same category
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

      // It's in a category, so load the category structure and find siblings
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

      // Find the current file's position in its category
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

  const handleDownload = () => {
    const fullMarkdown = markdownContent;
    // Create the filename for download
    const downloadFilename = filename.split("/").pop() || filename;
    MarkdownLoader.downloadMarkdown(downloadFilename, fullMarkdown);
  };

  const handleCopyLink = () => {
    // Get the current URL and add the hash
    const slug = filename.endsWith(".md") ? filename.slice(0, -3) : filename;
    const url = `${window.location.origin}${window.location.pathname}#${slug}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Handle TOC button click
  const handleTocButtonClick = () => {
    setTocSheetOpen(true);
    // Pause gesture detection when sheet is open to avoid conflicts
    pauseListening();
  };

  // Handle sheet open/close
  const handleSheetOpenChange = (open: boolean) => {
    setTocSheetOpen(open);
    // Resume/pause gesture detection based on sheet state
    if (open) {
      pauseListening();
    } else {
      resumeListening();
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Save user preference
    localStorage.setItem("preferredViewMode", mode);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div
          className={cn(
            "animate-pulse",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}
        >
          Loading document...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "p-4 rounded-md",
          isDarkMode
            ? "bg-red-900/20 border border-red-800 text-red-200"
            : "bg-red-50 border border-red-200 text-red-800"
        )}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen text-gray-400",
        isDarkMode ? "bg-[#1a1a1a]" : "bg-white text-gray-700"
      )}
    >
      {/* Main content */}
      <main className="max-w-4xl mx-auto px-0 py-0 sm:px-4">
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Document content */}
          <div className="col-span-1 md:col-span-3">
            <div
              ref={contentRef}
              className={cn(
                "p-6 sm:p-8 rounded-md border",
                isDarkMode
                  ? "bg-[#202020] border-[#303030]"
                  : "bg-white border-gray-200"
              )}
            >
              {/* Document toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
                {/* View toggle */}
                <ViewToggle
                  currentView={viewMode}
                  onViewChange={handleViewModeChange}
                />

                {/* Action buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="text-sm"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="text-sm"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">
                      {copied ? "Copied!" : "Share"}
                    </span>
                  </Button>

                  {tocItems.length > 0 && viewMode === "standard" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTocButtonClick}
                      className="text-sm"
                    >
                      <List className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Contents</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Content display based on selected view mode */}
              {viewMode === "standard" ? (
                <div className="standard-view">
                  <CustomMarkdownRenderer markdown={markdownContent} />
                </div>
              ) : (
                <div className="cards-view">
                  <MarkdownCardView markdown={markdownContent} />
                </div>
              )}

              {/* Table of Contents Sheet */}
              {viewMode === "standard" && (
                <TableOfContentsSheet
                  items={tocItems}
                  isOpen={tocSheetOpen}
                  onOpenChange={handleSheetOpenChange}
                  ref={contentRef}
                />
              )}

              {/* FloatingTOC Button (desktop) */}
              {tocItems.length > 0 && viewMode === "standard" && (
                <div className="hidden md:block relative float-right -mt-10 ml-4 mb-4">
                  <TableOfContentsButton
                    onClick={handleTocButtonClick}
                    itemCount={tocItems.length}
                  />
                </div>
              )}

              {/* FloatingTOC Button (mobile) */}
              {tocItems.length > 0 &&
                viewMode === "standard" &&
                !tocSheetOpen && (
                  <TableOfContentsButton
                    onClick={handleTocButtonClick}
                    itemCount={tocItems.length}
                    className="md:hidden"
                  />
                )}

              {/* Navigation between documents */}
              {viewMode === "standard" && (prevNext.prev || prevNext.next) && (
                <div
                  className={cn(
                    "mt-8 pt-4 flex border-t",
                    isDarkMode ? "border-[#303030]" : "border-gray-200"
                  )}
                >
                  {prevNext.prev ? (
                    <a
                      href={`#${prevNext.prev.replace(/\.md$/, "")}`}
                      className={cn(
                        "flex items-center px-3 py-2 mr-auto rounded-md text-sm",
                        isDarkMode
                          ? "bg-[#252525] text-gray-300 hover:bg-[#2a2a2a]"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      <ChevronLeft size={16} className="mr-2" />
                      Previous
                    </a>
                  ) : (
                    <div /> // Empty div to maintain space
                  )}

                  {prevNext.next && (
                    <a
                      href={`#${prevNext.next.replace(/\.md$/, "")}`}
                      className={cn(
                        "flex items-center px-3 py-2 ml-auto rounded-md text-sm",
                        isDarkMode
                          ? "bg-[#252525] text-gray-300 hover:bg-[#2a2a2a]"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      Next
                      <ChevronRight size={16} className="ml-2" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleMarkdownPage;
