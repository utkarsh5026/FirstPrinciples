import React, { useState, useEffect, useRef } from "react";
import { Category, MarkdownLoader } from "@/utils/MarkdownLoader";
import { useMarkdownProcessor } from "@/hooks/useMarkdownProcessor";
import LoadingScreen from "@/components/core/LoadingScreen";
import MarkdownCardView from "@/components/card/MarkdownCardView";
import FullScreenCardView from "@/components/card/fullscreen/FullScreenCardView";
import useMobile from "@/hooks/useMobile";
import ActionButtons from "./ActionButtons";

interface CardDocumentViewerProps {
  selectedFile: string;
  setSelectedFile: (file: string) => void;
}

/**
 * CardDocumentViewer component displays markdown documents in a card-based view.
 * It handles loading, displaying, and navigating through markdown content,
 * with support for fullscreen mode, downloading, and sharing.
 *
 * @param {Object} props - Component props
 * @param {string} props.selectedFile - Path to the currently selected markdown file
 * @param {Function} props.setSelectedFile - Function to update the selected file
 * @returns {React.ReactElement} The rendered component
 */
const CardDocumentViewer: React.FC<CardDocumentViewerProps> = ({
  selectedFile,
  setSelectedFile,
}) => {
  /**
   * State for storing the loaded markdown content
   */
  const [markdownContent, setMarkdownContent] = useState<string>("");

  /**
   * Loading state to show loading indicator while content is being fetched
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Error state to display error messages if document loading fails
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * State to track if the viewer is in fullscreen mode
   */
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * State to track if the share link has been copied to clipboard
   */
  const [copied, setCopied] = useState(false);

  /**
   * Reference to the content container element
   */
  const contentRef = useRef<HTMLDivElement>(null);

  /**
   * Hook to detect if the user is on a mobile device
   */
  useMobile();

  /**
   * Process markdown content into sections for card-based viewing
   */
  const { parsedSections } = useMarkdownProcessor(markdownContent);

  /**
   * Effect to load the initial document based on URL hash or first available file
   */
  useEffect(() => {
    const loadInitialDocument = async () => {
      const hashParams = window.location.hash.substring(1);

      if (hashParams) {
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

  /**
   * Effect to load document content whenever the selected file changes
   */
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

  /**
   * Find previous and next documents in the same category for navigation
   * @param {string} currentPath - Path of the current document
   */
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
    } catch (error) {
      console.error("Error finding prev/next documents:", error);
    }
  };

  /**
   * Handle document download by creating a downloadable file from the markdown content
   */
  const handleDownload = () => {
    if (!selectedFile || !markdownContent) return;

    // Create the filename for download
    const downloadFilename = selectedFile.split("/").pop() || selectedFile;
    MarkdownLoader.downloadMarkdown(downloadFilename, markdownContent);
  };

  /**
   * Handle sharing the document by copying a link to the clipboard
   */
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

  /**
   * Toggle between fullscreen and normal viewing modes
   */
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
    <div className="w-full mx-auto max-w-4xl h-full flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex flex-col" ref={contentRef}>
        <div className="bg-card rounded-xl border border-border/40 shadow-sm h-full flex flex-col">
          <ActionButtons
            toggleFullscreen={toggleFullscreen}
            handleDownload={handleDownload}
            handleCopyLink={handleCopyLink}
            copied={copied}
          />

          {/* Card view content */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto border-2">
            <MarkdownCardView
              markdown={markdownContent}
              parsedSections={parsedSections}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDocumentViewer;
