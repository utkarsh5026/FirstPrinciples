import React, { useState, useEffect, useRef } from "react";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { useMarkdownProcessor } from "@/hooks/useMarkdownProcessor";
import LoadingScreen from "@/components/core/LoadingScreen";
import MarkdownCardView from "@/components/card/MarkdownCardView";
import FullScreenCardView from "@/components/card/fullscreen/FullScreenCardView";
import useMobile from "@/hooks/useMobile";
import { ReadingAnalyticsService } from "@/utils/ReadingAnalyticsService";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { cn } from "@/lib/utils";
import Header from "./Header";
import AchievementDialog from "./AchievmentDialog";

interface CardDocumentViewerProps {
  selectedFile: string;
}

/**
 * Enhanced CardDocumentViewer component displays markdown documents in a card-based view.
 * It handles loading, displaying, and navigating through markdown content,
 * with support for fullscreen mode, downloading, and sharing.
 *
 * This modernized version includes improved aesthetics, animations, and mobile optimizations.
 *
 * @param {Object} props - Component props
 * @param {string} props.selectedFile - Path to the currently selected markdown file
 * @param {Function} props.setSelectedFile - Function to update the selected file
 * @returns {React.ReactElement} The rendered component
 */
const CardDocumentViewer: React.FC<CardDocumentViewerProps> = ({
  selectedFile,
}) => {
  // Document content state
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Document metadata
  const [documentTitle, setDocumentTitle] = useState("");
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  // Achievement popups
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [achievementTitle, setAchievementTitle] = useState("");
  const [achievementDescription, setAchievementDescription] = useState("");
  const [xpGained, setXpGained] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Detect if the user is on a mobile device
  const { isMobile } = useMobile();

  // Process markdown content into sections for card-based viewing
  const { parsedSections } = useMarkdownProcessor(markdownContent);

  // Get theme context for dynamic styling
  const { currentTheme } = useTheme();

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

        // Set document metadata
        setDocumentTitle(
          result.frontmatter.title ||
            MarkdownLoader.getFilenameFromPath(selectedFile)
        );

        // Calculate estimated reading time (roughly 200 words per minute)
        const wordCount = result.content.split(/\s+/).length;
        const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
        setEstimatedReadTime(readTimeMinutes);

        // Record the reading activity after a short delay
        setTimeout(() => {
          recordReadingActivity(
            selectedFile,
            result.frontmatter.title || selectedFile
          );
        }, 2000); // 2 seconds delay
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
   * Record reading activity and check for achievements/levels
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 w-full rounded-4xl bg-card/70 backdrop-blur-[2px] border border-border/30 shadow-sm font-cascadia-code">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/30 text-destructive p-6 rounded-xl max-w-md shadow-lg"
        >
          <h3 className="font-medium mb-2 flex items-center">
            <ChevronLeft className="h-5 w-5 mr-2" />
            Error Loading Document
          </h3>
          <p>{error}</p>
        </motion.div>
      </div>
    );
  }

  // If no file is selected yet, show welcome screen
  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center p-8 max-w-lg"
        >
          <div className="bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-4 mx-auto">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium mb-4">
            Welcome to Card View Documentation
          </h2>
          <p className="text-muted-foreground mb-6">
            Select a document from the sidebar to get started with our enhanced
            reading experience.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Button variant="outline" size="sm" className="rounded-full">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Open Sidebar
            </Button>
            <Button
              variant="default"
              size="sm"
              className="rounded-full bg-primary/90 hover:bg-primary"
            >
              Browse Documents
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="w-full mx-auto max-w-4xl h-full flex flex-col"
      >
        <Header
          documentTitle={documentTitle}
          markdownContent={markdownContent}
          estimatedReadTime={estimatedReadTime}
          selectedFile={selectedFile}
          toggleFullscreen={toggleFullscreen}
        />

        {/* Main content area */}
        <motion.div
          className="flex-1 flex flex-col"
          ref={contentRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="bg-card/70 backdrop-blur-[2px] rounded-4xl border border-border/30 shadow-sm h-full flex flex-col relative overflow-hidden"
            ref={cardContainerRef}
          >
            {/* Decorative glows */}
            <div
              className="absolute pointer-events-none -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: currentTheme.primary }}
            />
            <div
              className="absolute pointer-events-none -bottom-20 -left-20 w-40 h-40 rounded-full opacity-10 blur-3xl"
              style={{ backgroundColor: currentTheme.primary }}
            />

            {/* Card content and Table of Contents */}
            <div className="flex-1 flex overflow-hidden relative">
              <div
                className={cn(
                  "flex-1 overflow-hidden",
                  !isMobile ? "md:w-[calc(100%-16rem)]" : "w-full"
                )}
              >
                <div className="p-2 sm:p-6 h-full border-2 rounded-4xl">
                  <MarkdownCardView
                    markdown={markdownContent}
                    parsedSections={parsedSections}
                    className="h-full rounded-4xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <AchievementDialog
          showAchievementPopup={showAchievementPopup}
          closeAchievementPopup={closeAchievementPopup}
          levelUp={levelUp}
          achievementTitle={achievementTitle}
          achievementDescription={achievementDescription}
          xpGained={xpGained}
          newLevel={newLevel}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default CardDocumentViewer;
