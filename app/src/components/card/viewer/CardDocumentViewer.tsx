// src/components/card/viewer/CardDocumentViewer.tsx
import React, { useState, useEffect, useRef } from "react";
import { Category, MarkdownLoader } from "@/utils/MarkdownLoader";
import { useMarkdownProcessor } from "@/hooks/useMarkdownProcessor";
import LoadingScreen from "@/components/core/LoadingScreen";
import MarkdownCardView from "@/components/card/MarkdownCardView";
import FullScreenCardView from "@/components/card/fullscreen/FullScreenCardView";
import useMobile from "@/hooks/useMobile";
import ActionButtons from "./ActionButtons";
import { ReadingAnalyticsService } from "@/utils/ReadingAnalyticsService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Sparkles, ArrowUp } from "lucide-react";

interface CardDocumentViewerProps {
  selectedFile: string;
  setSelectedFile: (file: string) => void;
}

/**
 * CardDocumentViewer component displays markdown documents in a card-based view.
 * It handles loading, displaying, and navigating through markdown content,
 * with support for fullscreen mode, downloading, and sharing.
 *
 * Enhanced with gamification features that track reading activity and show achievement popups.
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
   * States for achievement popups
   */
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [achievementTitle, setAchievementTitle] = useState("");
  const [achievementDescription, setAchievementDescription] = useState("");
  const [xpGained, setXpGained] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

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

        // Record the reading activity after a short delay to ensure
        // the user is actually reading rather than just navigating
        setTimeout(() => {
          recordReadingActivity(
            selectedFile,
            result.frontmatter.title || selectedFile
          );
        }, 3000); // 3 seconds delay
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
   * Record reading activity and check for new achievements/levels
   * @param {string} path - Path of the document being read
   * @param {string} title - Title of the document
   */
  const recordReadingActivity = (path: string, title: string) => {
    try {
      // Get current stats
      const previousStats = ReadingAnalyticsService.getReadingStats();
      const previousAchievements = ReadingAnalyticsService.getAchievements();
      const previousLevel = previousStats.level;

      // Record the reading
      ReadingAnalyticsService.addToReadingHistory(path, title);

      // Get updated stats and achievements
      const updatedStats = ReadingAnalyticsService.getReadingStats();
      const updatedAchievements = ReadingAnalyticsService.getAchievements();

      // Check for new achievements
      const newAchievements = updatedAchievements.filter(
        (a) =>
          a.unlockedAt !== null &&
          !previousAchievements.some(
            (pa) => pa.id === a.id && pa.unlockedAt !== null
          )
      );

      // Check for level up
      const didLevelUp = updatedStats.level > previousLevel;

      // Show achievement popup if there are new achievements or level up
      if (newAchievements.length > 0) {
        const latestAchievement = newAchievements[0];
        setAchievementTitle(latestAchievement.title);
        setAchievementDescription(latestAchievement.description);
        setXpGained(75); // Default XP for an achievement
        setShowAchievementPopup(true);
      } else if (didLevelUp) {
        setLevelUp(true);
        setNewLevel(updatedStats.level);
        setXpGained(updatedStats.totalXP - previousStats.totalXP);
        setAchievementTitle(`Level ${updatedStats.level} Reached!`);
        setAchievementDescription(
          `You've reached level ${updatedStats.level}! Keep reading to unlock more features.`
        );
        setShowAchievementPopup(true);
      }
    } catch (error) {
      console.error("Error recording reading activity:", error);
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

  /**
   * Close the achievement popup
   */
  const closeAchievementPopup = () => {
    setShowAchievementPopup(false);
    setLevelUp(false);
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

      {/* Achievement popup dialog */}
      <Dialog open={showAchievementPopup} onOpenChange={closeAchievementPopup}>
        <DialogContent className="sm:max-w-md border-primary/20 font-cascadia-code">
          <DialogHeader className="text-center">
            <DialogTitle className="flex flex-col items-center gap-2 text-xl">
              {levelUp ? (
                <ArrowUp className="h-10 w-10 text-primary animate-pulse" />
              ) : (
                <Trophy className="h-10 w-10 text-primary animate-pulse" />
              )}
              <span>{achievementTitle}</span>
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {achievementDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="mb-4 flex items-center justify-center">
              {levelUp ? (
                <div className="text-4xl font-bold text-primary flex items-center">
                  {newLevel}
                  <Star className="h-6 w-6 text-yellow-500 ml-2" />
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-xl font-semibold text-primary">
                    +{xpGained} XP
                  </span>
                </div>
              )}
            </div>

            <div className="text-center text-muted-foreground text-sm max-w-xs">
              {levelUp ? (
                <p>
                  Keep up the good work! Unlock new features and benefits as you
                  level up.
                </p>
              ) : (
                <p>
                  Great job! Continue reading to unlock more achievements and
                  gain experience.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={closeAchievementPopup}
              className="w-full bg-primary/90 hover:bg-primary"
            >
              Continue Reading
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardDocumentViewer;
