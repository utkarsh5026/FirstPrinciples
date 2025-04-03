// src/components/core/SimpleMarkdownPage.tsx
import React, { useEffect, useState, useRef } from "react";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import MarkdownCardView from "@/components/card/MarkdownCardView";
import FullScreenCardView from "@/components/card/fullscreen/FullScreenCardView";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import {
  Download,
  Share,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Book,
} from "lucide-react";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import TableOfContentsSheet from "@/components/toc/TableOfContentsSheet";
import TableOfContentsButton from "@/components/core/TableOfContentsButton";
import ViewToggle, { type ViewMode } from "@/components/card/ViewToggle";
import { type Category } from "@/utils/MarkdownLoader";
import { Button } from "@/components/ui/button";
import LoadingScreen from "./LoadingScreen";
import { useMarkdownProcessor } from "@/hooks/useMarkdownProcessor";
import BreadcrumbNav from "@/components/navigation/BreadCrumbNav";
import useMobile from "@/hooks/useMobile";

interface SimpleMarkdownPageProps {
  filename: string;
}

const SimpleMarkdownPage: React.FC<SimpleMarkdownPageProps> = ({
  filename,
}) => {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [prevNext, setPrevNext] = useState<{ prev?: string; next?: string }>(
    {}
  );
  const [tocSheetOpen, setTocSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("standard");
  const [isFullscreenCard, setIsFullscreenCard] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobile();

  // Use the optimized markdown processor hook
  const { tocItems, parsedSections } = useMarkdownProcessor(markdownContent);

  // Set up swipe gestures for mobile in standard view
  const { pauseListening, resumeListening } = useSwipeGesture({
    targetRef: contentRef as React.RefObject<HTMLElement>,
    onSwipeLeft: () => {
      if (isMobile && viewMode === "standard") setTocSheetOpen(true);
    },
    onDoubleTap: () => {
      if (isMobile && viewMode === "standard") setTocSheetOpen(true);
    },
  });

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

        // Set the document title
        if (result.frontmatter && result.frontmatter.title) {
          setDocumentTitle(result.frontmatter.title);
        } else {
          // Extract title from filename
          const filenameOnly = filename.split("/").pop() || filename;
          const titleCase = filenameOnly
            .replace(".md", "")
            .replace(/_/g, " ")
            .replace(/-/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          setDocumentTitle(titleCase);
        }

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
    // Reset fullscreen state when switching to standard mode
    if (mode === "standard") {
      setIsFullscreenCard(false);
    }
    // Save user preference
    localStorage.setItem("preferredViewMode", mode);
  };

  // Toggle fullscreen card view
  const toggleFullscreenCard = () => {
    setIsFullscreenCard(!isFullscreenCard);
  };

  if (loading) {
    return <LoadingScreen />;
  }

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

  // Render fullscreen card view
  if (viewMode === "cards" && isFullscreenCard) {
    return (
      <FullScreenCardView
        markdown={markdownContent}
        onExit={() => setIsFullscreenCard(false)}
        parsedSections={parsedSections}
      />
    );
  }

  return (
    <div className="w-full mx-auto max-w-5xl">
      {/* Breadcrumb navigation */}
      <div className="mb-4 font-type-mono">
        <BreadcrumbNav filePath={filename} className="px-2 sm:px-0" />
      </div>

      {/* Main content with refined layout */}
      <div className="relative">
        <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
          {/* Document header with title and actions */}
          <div className="px-4 sm:px-6 py-4 border-b border-border/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-type-mono">
            <h1 className="text-xl font-medium text-foreground line-clamp-1">
              {documentTitle}
            </h1>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* View mode toggle */}
              <ViewToggle
                currentView={viewMode}
                onViewChange={handleViewModeChange}
              />

              {/* Action buttons - consolidated for mobile */}
              <div className="flex gap-2 font-cascadia-code">
                {viewMode === "cards" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreenCard}
                    className="h-8 w-8 sm:w-auto sm:px-3 rounded-full sm:rounded-md"
                    title="Fullscreen mode"
                  >
                    <Maximize2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1.5">Fullscreen</span>
                  </Button>
                )}

                {tocItems.length > 0 && viewMode === "standard" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTocButtonClick}
                    className="h-8 w-8 sm:w-auto sm:px-3 rounded-full sm:rounded-md"
                    title="Table of contents"
                  >
                    <Book className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1.5">Contents</span>
                  </Button>
                )}

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

          {/* Document content area */}
          <div ref={contentRef} className="relative">
            {viewMode === "standard" ? (
              <div className="p-5 sm:p-8">
                <CustomMarkdownRenderer markdown={markdownContent} />
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <MarkdownCardView
                  markdown={markdownContent}
                  parsedSections={parsedSections}
                />
              </div>
            )}
          </div>

          {/* Navigation between documents - only in standard view */}
          {viewMode === "standard" && (prevNext.prev || prevNext.next) && (
            <div className="border-t border-border/30 mt-4 p-4 font-type-mono">
              <div className="flex justify-between items-center">
                {prevNext.prev ? (
                  <a
                    href={`#${prevNext.prev.replace(/\.md$/, "")}`}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md hover:bg-secondary/20 transition-colors "
                  >
                    <ChevronLeft size={16} />
                    <span className="font-cascadia-code">Previous</span>
                  </a>
                ) : (
                  <div></div>
                )}

                {prevNext.next && (
                  <a
                    href={`#${prevNext.next.replace(/\.md$/, "")}`}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md hover:bg-secondary/20 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Table of Contents Sheet */}
        {viewMode === "standard" && (
          <TableOfContentsSheet
            items={tocItems}
            isOpen={tocSheetOpen}
            onOpenChange={handleSheetOpenChange}
            ref={contentRef}
          />
        )}

        {/* Float TOC Button - only shown on mobile in standard view */}
        {tocItems.length > 0 && viewMode === "standard" && !tocSheetOpen && (
          <TableOfContentsButton
            onClick={handleTocButtonClick}
            itemCount={tocItems.length}
            className="md:hidden"
          />
        )}
      </div>
    </div>
  );
};

export default SimpleMarkdownPage;
