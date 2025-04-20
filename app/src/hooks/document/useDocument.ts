import { useCallback, useEffect, useState } from "react";
import { useDocumentLoader } from "@/hooks/loading/useDocumentLoader";
import { useMarkdownProcessor } from "@/hooks/useMarkdownProcessor";
import {
  estimateReadingTime,
  countWords,
} from "@/services/analytics/word-count-estimation";

interface Metrics {
  estimatedWordCount: number;
  estimatedReadTime: number;
  category: string;
}

export const useDocument = (documentPath: string) => {
  const { markdownContent, loading, error, documentTitle } =
    useDocumentLoader(documentPath);
  const [metrics, setMetrics] = useState<Metrics>({
    estimatedWordCount: 0,
    estimatedReadTime: 0,
    category: "",
  });

  const { parsedSections } = useMarkdownProcessor(markdownContent);

  /**
   * Generates a clean preview excerpt from markdown content
   */
  const generatePreview = useCallback(
    (
      markdownContent: string,
      maxLength: number = 300,
      paragraphs: number = 2
    ): string => {
      if (!markdownContent) return "";

      // Clean up the markdown
      const cleanContent = markdownContent
        // Remove headings
        .replace(/#{1,6}.+/g, "")
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, "")
        // Remove inline code
        .replace(/`[^`]+`/g, "")
        // Remove images
        .replace(/!\[.*?\]\(.*?\)/g, "")
        // Replace links with just their text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // Remove formatting markers
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/~~(.*?)~~/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/_(.*?)_/g, "$1")
        // Clean up extra whitespace
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      // Find the first couple of non-empty paragraphs
      const allParagraphs = cleanContent
        .split("\n\n")
        .filter((p) => p.trim().length > 0);
      const previewParagraphs = allParagraphs.slice(0, paragraphs).join("\n\n");

      // Truncate to the specified max length
      if (previewParagraphs.length > maxLength) {
        // Try to truncate at a sentence boundary
        const truncated = previewParagraphs.substring(0, maxLength);
        const lastPeriod = truncated.lastIndexOf(".");

        if (lastPeriod > maxLength * 0.7) {
          // If we can find a good sentence break point, use it
          return truncated.substring(0, lastPeriod + 1);
        }

        // Otherwise just truncate with ellipsis
        return truncated + "...";
      }

      return previewParagraphs;
    },
    []
  );

  useEffect(() => {
    const wordCount = countWords(markdownContent);
    const readTime = estimateReadingTime(wordCount);
    const category = documentPath.split("/")[0];
    setMetrics({
      estimatedWordCount: wordCount,
      estimatedReadTime: readTime,
      category,
    });
  }, [markdownContent, documentPath]);

  return {
    markdownContent,
    loading,
    error,
    documentTitle,
    generatePreview,
    parsedSections,
    metrics,
  };
};
