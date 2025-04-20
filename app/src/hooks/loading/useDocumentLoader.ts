import { useState, useEffect, useCallback } from "react";
import { useReadingStore } from "@/stores";
import { analyticsController } from "@/services/analytics/AnalyticsController";
import { loadMarkdownContent, getFilenameFromPath } from "@/services/document";

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

  const { addToReadingList } = useReadingStore();

  /**
   * 📊 Records your reading activity and checks for cool achievements!
   * This function is like your personal reading journal keeper.
   */
  const recordReadingActivity = useCallback(
    async (path: string, title: string) => {
      try {
        console.log("recordReadingActivity", path, title);
        await addToReadingList(path, title);
      } catch (error) {
        console.error("Error recording reading activity:", error);
      }
    },
    [addToReadingList]
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
      const result = await loadMarkdownContent(selectedFile);

      if (!result) {
        setError("Document not found");
        setLoading(false);
        return;
      }

      setMarkdownContent(result.content);

      const title =
        result.frontmatter.title || getFilenameFromPath(selectedFile);
      setDocumentTitle(title);

      setTimeout(() => {
        recordReadingActivity(selectedFile, title);
      }, 2000);
    } catch (err) {
      console.error("Failed to load markdown:", err);
      setError(`Failed to load document: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, recordReadingActivity]);

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
  }, [selectedFile, loadDocument, documentTitle]);

  return {
    markdownContent,
    loading,
    error,
    documentTitle,
  };
};
