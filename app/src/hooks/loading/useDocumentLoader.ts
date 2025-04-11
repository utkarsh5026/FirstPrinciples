import { useState, useEffect, useCallback } from "react";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { useMarkdownProcessor } from "@/hooks/useMarkdownProcessor";
import { useReadingHistory } from "@/hooks/reading/useReadingHistory";
import { useReadingMetrics } from "@/hooks/reading/useReadingMetrics";
import { useSectionReading } from "@/hooks/reading/useSectionReading";
import { useServices } from "@/context/services/ServiceContext";
import { useAchievements } from "@/hooks/reading/useAchievements";

export type AchievementData = {
  title: string;
  description: string;
  xpGained: number;
  isLevelUp: boolean;
  newLevel: number;
};

/**
 * ✨ useDocumentLoader: Your magical document reading companion! ✨
 *
 * This delightful hook makes document reading a breeze by handling all the complex
 * stuff behind the scenes. It's like having a personal librarian who:
 *
 * 📚 Fetches your markdown documents and prepares them for reading
 * 🔍 Extracts important details like title and reading time
 * 📊 Tracks your reading progress and habits
 * 🏆 Celebrates your achievements with fun popups
 * 📝 Organizes content into easy-to-navigate sections
 *
 * When you're reading documents in our app, this hook is working hard to make
 * your experience smooth and rewarding! It connects with our achievement system
 * to give you that dopamine boost when you reach milestones. 🎉
 */
export const useDocumentLoader = (selectedFile: string) => {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [achievementToShow, setAchievementToShow] =
    useState<AchievementData | null>(null);

  const { newAchievements, currentLevelUp, acknowledgeAll, loadAchievements } =
    useAchievements();

  const { analyticsController, wordCountEstimator } = useServices();
  const { addToReadingHistory } = useReadingHistory();
  const { metrics, refreshMetrics } = useReadingMetrics();

  const { parsedSections } = useMarkdownProcessor(markdownContent);
  const sectionReading = useSectionReading(
    selectedFile,
    documentTitle,
    parsedSections,
    0
  );

  console.log(documentTitle);

  /**
   * 📊 Records your reading activity and checks for cool achievements!
   * This function is like your personal reading journal keeper.
   */
  const recordReadingActivity = useCallback(
    async (path: string, title: string) => {
      try {
        console.log("recordReadingActivity", path, title);
        await addToReadingHistory(path, title);
        await refreshMetrics();
        await loadAchievements();
        analyticsController.startReading(path, title);
      } catch (error) {
        console.error("Error recording reading activity:", error);
      }
    },
    [addToReadingHistory, refreshMetrics, analyticsController, loadAchievements]
  );

  /**
   * 📚 Fetches your document and gets it ready for reading!
   * Like a librarian finding the perfect book and preparing it for you.
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

  /**
   * 🎯 Closes achievement popups after you've seen your awesome rewards!
   */
  const closeAchievementPopup = useCallback(() => {
    setShowAchievementPopup(false);
    acknowledgeAll();
    setAchievementToShow(null);
  }, [acknowledgeAll]);

  /**
   * 🔄 Automatically loads your document when you select a new one!
   * It's like magic - just pick a document and it appears!
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

  /**
   * 🏆 Shows you fun achievement popups when you accomplish something cool!
   * Everyone loves a little celebration of their progress!
   */
  useEffect(() => {
    // When new achievements are detected, show the first one
    if (newAchievements.length > 0) {
      const achievement = newAchievements[0];
      setAchievementToShow({
        title: achievement.title,
        description: achievement.description,
        xpGained: 75,
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

  return {
    markdownContent,
    loading,
    error,
    documentTitle,
    estimatedReadTime,
    parsedSections,

    showAchievementPopup,
    closeAchievementPopup,

    sectionReading,
    achievementToShow,
    metrics,
  };
};
