import { useState, useEffect, useCallback } from "react";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { useMarkdownProcessor } from "@/hooks/useMarkdownProcessor";
import { useReadingHistory } from "@/hooks/reading/useReadingHistory";
import { useReadingMetrics } from "@/hooks/reading/useReadingMetrics";
import { useSectionReading } from "@/hooks/reading/useSectionReading";
import { useServices } from "@/context/ServiceContext";
import { useAchievements } from "@/hooks/reading/useAchievements";

export type AchievementData = {
  title: string;
  description: string;
  xpGained: number;
  isLevelUp: boolean;
  newLevel: number;
};

/**
 * Custom hook for loading, parsing and tracking document reading
 *
 * This hook centralizes document-related functionality:
 * - Loading markdown content from a file path
 * - Parsing document metadata
 * - Processing markdown into sections
 * - Calculating estimated reading time
 * - Tracking reading analytics and achievements
 * - Providing section navigation
 */
export const useDocumentLoader = (selectedFile: string) => {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  // State for achievement popups
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [achievementToShow, setAchievementToShow] =
    useState<AchievementData | null>(null);

  const { newAchievements, currentLevelUp, acknowledgeAll, loadAchievements } =
    useAchievements();

  const { analyticsController, wordCountEstimator } = useServices();
  const { addToReadingHistory } = useReadingHistory();
  const { metrics, refreshMetrics } = useReadingMetrics();

  // Process markdown content into sections
  const { parsedSections } = useMarkdownProcessor(markdownContent);

  // Use section reading tracking when content is available
  const sectionReading = useSectionReading(
    selectedFile,
    documentTitle,
    parsedSections,
    0
  );

  /**
   * Record reading activity and check for achievements/levels
   */
  const recordReadingActivity = useCallback(
    async (path: string, title: string) => {
      try {
        // Record the reading in history
        await addToReadingHistory(path, title);

        // Refresh metrics to capture any changes
        await refreshMetrics();

        // Check for achievements or level ups
        await loadAchievements();

        // Start reading session via the analytics controller
        analyticsController.startReading(path, title);
      } catch (error) {
        console.error("Error recording reading activity:", error);
      }
    },
    [addToReadingHistory, refreshMetrics, analyticsController, loadAchievements]
  );

  /**
   * Load document content and metadata from the selected file path
   */
  const loadDocument = useCallback(async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const result = await MarkdownLoader.loadMarkdownContent(selectedFile);

      if (!result) {
        setError("Document not found");
        setLoading(false);
        return;
      }

      setMarkdownContent(result.content);

      const title =
        result.frontmatter.title ||
        MarkdownLoader.getFilenameFromPath(selectedFile);
      setDocumentTitle(title);

      const wordCount = wordCountEstimator.countWords(result.content);
      const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
      setEstimatedReadTime(readTimeMinutes);

      setTimeout(() => {
        recordReadingActivity(selectedFile, title);
      }, 2000);
    } catch (err) {
      console.error("Failed to load markdown:", err);
      setError(`Failed to load document: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, wordCountEstimator, recordReadingActivity]);

  const closeAchievementPopup = useCallback(() => {
    setShowAchievementPopup(false);
    acknowledgeAll();
    setAchievementToShow(null);
  }, [acknowledgeAll]);

  /**
   * Load document when selected file changes
   */
  useEffect(() => {
    if (selectedFile) {
      loadDocument();
    }

    return () => {
      if (selectedFile) {
        analyticsController.endReading(selectedFile, documentTitle);
      }
    };
  }, [selectedFile, loadDocument, analyticsController, documentTitle]);

  useEffect(() => {
    // When new achievements are detected, show the first one
    if (newAchievements.length > 0) {
      const achievement = newAchievements[0];
      setAchievementToShow({
        title: achievement.title,
        description: achievement.description,
        xpGained: 75, // Default or get from achievement
        isLevelUp: false,
        newLevel: 0,
      });
      setShowAchievementPopup(true);
    }
    // Or show level up if there is one
    else if (currentLevelUp) {
      setAchievementToShow({
        title: `Level ${currentLevelUp.newLevel} Reached!`,
        description: `You've reached level ${currentLevelUp.newLevel}! Keep reading to unlock more features.`,
        xpGained: currentLevelUp.xpGained,
        isLevelUp: true,
        newLevel: currentLevelUp.newLevel,
      });
      setShowAchievementPopup(true);
    }
  }, [newAchievements, currentLevelUp]);

  // Return all the necessary data and functions
  return {
    markdownContent,
    loading,
    error,
    documentTitle,
    estimatedReadTime,
    parsedSections,

    // Achievement data
    showAchievementPopup,
    closeAchievementPopup,

    // Section reading data and functions
    sectionReading,
    achievementToShow,

    // Reading metrics
    metrics,
  };
};
