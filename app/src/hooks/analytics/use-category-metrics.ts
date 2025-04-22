import {
  sectionWorkerManager,
  analyticsWorkerManager,
} from "@/infrastructure/workers";
import { SectionReadingData } from "@/services/reading/section-reading-service";
import { useCallback } from "react";
import { withErrorHandling } from "@/utils/functions/error";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import type { FileMetadata } from "@/services/document";

export const useCategoryMetrics = () => {
  const getCategoryWordsRead = useCallback(
    async (sectionReadings: SectionReadingData[], category?: string) => {
      return withErrorHandling(
        async () =>
          sectionWorkerManager.getCategoryWordsRead(sectionReadings, category),
        0,
        {
          errorPrefix: "Failed to get words read for category:",
          logError: true,
        }
      )();
    },
    []
  );

  const getCategoryTimeSpent = useCallback(
    async (sectionReadings: SectionReadingData[], category?: string) => {
      return withErrorHandling(
        async () =>
          sectionWorkerManager.getCategoryTimeSpent(sectionReadings, category),
        0,
        {
          errorPrefix: "Failed to get time spent for category:",
          logError: true,
        }
      )();
    },
    []
  );

  const getCategoryMetrics = useCallback(
    async (sectionReadings: SectionReadingData[], category?: string) => {
      return withErrorHandling(
        async () =>
          sectionWorkerManager.getCategoryMetrics(sectionReadings, category),
        {
          wordsRead: 0,
          timeSpent: 0,
          avgReadingSpeed: 0,
          completedSections: 0,
          totalSections: 0,
          completionPercentage: 0,
        },
        {
          errorPrefix: "Failed to get metrics for category:",
          logError: true,
        }
      )();
    },
    []
  );

  const createCategoryBreakdown = useCallback(
    async (
      readingHistory: ReadingHistoryItem[],
      availableDocuments: FileMetadata[]
    ) => {
      return withErrorHandling(
        async () =>
          analyticsWorkerManager.calculateCategoryBreakdown(
            readingHistory,
            availableDocuments
          ),
        [],
        {
          errorPrefix: "Failed to create category breakdown:",
          logError: true,
        }
      )();
    },
    []
  );
  return {
    getCategoryWordsRead,
    getCategoryTimeSpent,
    getCategoryMetrics,
    createCategoryBreakdown,
  };
};
