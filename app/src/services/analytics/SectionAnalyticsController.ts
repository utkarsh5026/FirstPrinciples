import { databaseService } from "@/infrastructure/storage";
import {
  sectionReadingTracker,
  SectionReadingData,
  type DocumentStats,
} from "./SectionReadingTracker";
import { analyticsController } from "./AnalyticsController";
import { type ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { estimateReadingTime, countWords } from "./word-count-estimation";

/**
 * Controller that manages section-level analytics
 */
export class SectionAnalyticsController {
  /**
   * Get all reading sections for a document
   * @param documentPath Document path
   * @returns Promise with array of section reading data
   */
  public async getDocumentSections(
    documentPath: string
  ): Promise<SectionReadingData[]> {
    try {
      return await databaseService.getByIndex<SectionReadingData>(
        "sectionReadings",
        "documentPath",
        documentPath
      );
    } catch (error) {
      console.error("Error getting document sections:", error);
      return [];
    }
  }

  /**
   * Get combined document completion stats
   * @returns Promise with document stats including completion percentages
   */
  public async getDocumentStats() {
    try {
      // Get all document stats
      const docStats = await databaseService.getAll<DocumentStats>(
        "documentStats"
      );

      // Get reading history for additional metadata
      const readingHistory = await databaseService.getAll<ReadingHistoryItem>(
        "readingHistory"
      );

      // Combine stats with history data
      return docStats.map((stats) => {
        const historyItem = readingHistory.find((h) => h.path === stats.path);
        return {
          ...stats,
          title:
            historyItem?.title ??
            stats.path.split("/").pop()?.replace(".md", ""),
          timeSpent: historyItem?.timeSpent ?? 0,
          readCount: historyItem?.readCount ?? 0,
        };
      });
    } catch (error) {
      console.error("Error getting document stats:", error);
      return [];
    }
  }

  /**
   * Record user viewing a section
   * @param documentPath Document path
   * @param documentTitle Document title
   * @param sectionId Section ID
   * @param sectionTitle Section title
   * @param sectionIndex Section index
   * @param sectionContent Section content
   */
  public startSectionReading(
    documentPath: string,
    documentTitle: string,
    sectionId: string,
    sectionTitle: string,
    sectionIndex: number,
    sectionContent: string
  ): void {
    // Start document reading if this is the first section
    if (sectionIndex === 0) {
      analyticsController.startReading(documentPath, documentTitle);
    }

    // Start section reading
    sectionReadingTracker.startSectionReading(
      documentPath,
      sectionId,
      sectionTitle,
      sectionIndex,
      sectionContent
    );
  }

  /**
   * End section reading and update analytics
   * @param markComplete Whether to mark the section as complete
   * @returns Promise with the completed section data
   */
  public async endSectionReading(
    markComplete = false
  ): Promise<SectionReadingData | null> {
    return sectionReadingTracker.endSectionReading(markComplete);
  }

  /**
   * Get overall section reading progress
   * @returns Promise with section reading statistics
   */
  public async getSectionReadingProgress(): Promise<{
    totalSections: number;
    completedSections: number;
    completionPercentage: number;
  }> {
    try {
      // Get all section readings
      const allSections = await databaseService.getAll<SectionReadingData>(
        "sectionReadings"
      );

      // Count unique sections
      const uniqueSectionIds = new Set(allSections.map((s) => s.sectionId));
      const totalSections = uniqueSectionIds.size;

      // Count completed sections
      const completedSections = allSections.filter((s) => s.isComplete).length;

      // Calculate percentage
      const completionPercentage =
        totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

      return {
        totalSections,
        completedSections,
        completionPercentage,
      };
    } catch (error) {
      console.error("Error getting section reading progress:", error);
      return {
        totalSections: 0,
        completedSections: 0,
        completionPercentage: 0,
      };
    }
  }

  /**
   * Get estimated reading time for a single section
   * @param sectionContent The content of the section
   * @returns Estimated reading time in minutes
   */
  public getEstimatedSectionReadingTime(sectionContent: string): number {
    const wordCount = countWords(sectionContent);
    const timeMs = estimateReadingTime(wordCount);
    return Math.ceil(timeMs / (1000 * 60)); // Convert to minutes and round up
  }

  /**
   * Mark a section as read
   * @param documentPath Document path
   * @param sectionId Section ID
   * @returns Promise with boolean indicating success
   */
  public async markSectionAsRead(
    documentPath: string,
    sectionId: string
  ): Promise<boolean> {
    try {
      // Get existing section reading data
      const sections = await databaseService.getByIndex<
        SectionReadingData & { id: IDBValidKey }
      >("sectionReadings", "sectionId", sectionId);

      // If section exists, update it
      if (sections.length > 0) {
        const section = sections[0];
        section.isComplete = true;
        section.endTime = section.endTime ?? Date.now();
        section.duration = section.duration ?? 60000; // Default to 1 minute if no duration

        await databaseService.update("sectionReadings", section);

        // Update document completion
        await this.updateDocumentCompletion(documentPath);
        return true;
      } else {
        // Section doesn't exist, create a new record
        const newSection: SectionReadingData = {
          sectionId,
          documentPath,
          sectionTitle: "Unknown Section", // Default title
          sectionIndex: 0,
          startTime: Date.now() - 60000, // 1 minute ago
          endTime: Date.now(),
          duration: 60000,
          wordCount: 0,
          isComplete: true,
        };

        await databaseService.add("sectionReadings", newSection);

        // Update document completion
        await this.updateDocumentCompletion(documentPath);
        return true;
      }
    } catch (error) {
      console.error("Error marking section as read:", error);
      return false;
    }
  }

  /**
   * Update document completion percentage
   * @param documentPath Document path
   */
  private async updateDocumentCompletion(documentPath: string): Promise<void> {
    try {
      // Get all sections for this document
      const allSections = await databaseService.getByIndex<SectionReadingData>(
        "sectionReadings",
        "documentPath",
        documentPath
      );

      // Count completed sections
      const uniqueSectionIds = new Set(allSections.map((s) => s.sectionId));
      const totalSections = uniqueSectionIds.size;

      // Count unique completed section IDs
      const completedSectionIds = new Set(
        allSections
          .filter((section) => section.isComplete)
          .map((section) => section.sectionId)
      );

      const completedSections = completedSectionIds.size;

      // Only update if we have sections
      if (totalSections > 0) {
        const completionPercentage = (completedSections / totalSections) * 100;

        // Update document stats
        const docStats = await databaseService.getByIndex<
          DocumentStats & { id: IDBValidKey }
        >("documentStats", "path", documentPath);

        if (docStats.length > 0) {
          await databaseService.update("documentStats", {
            ...docStats[0],
            completionPercentage: completionPercentage,
            lastReadAt: Date.now(),
          });
        } else {
          await databaseService.add("documentStats", {
            path: documentPath,
            completionPercentage: completionPercentage,
            lastReadAt: Date.now(),
          });
        }
      }
    } catch (error) {
      console.error("Error updating document completion:", error);
    }
  }

  /**
   * Get all analytics data including section-level metrics
   */
  public async getAllAnalytics() {
    try {
      // Get base analytics from the main controller
      const baseAnalytics = await analyticsController.getAnalyticsData();

      // Get section-specific analytics
      const sectionReadings = await databaseService.getAll<SectionReadingData>(
        "sectionReadings"
      );
      const documentStats = await this.getDocumentStats();
      const sectionProgress = await this.getSectionReadingProgress();

      // Add section data to analytics
      return {
        ...baseAnalytics,
        sectionReadings,
        documentStats,
        sectionProgress,
      };
    } catch (error) {
      console.error("Error getting all analytics data:", error);
      throw error;
    }
  }

  /**
   * Reset all section analytics data
   */
  public async resetSectionAnalytics(): Promise<void> {
    try {
      await databaseService.clearStore("sectionReadings");
      await databaseService.clearStore("documentStats");
      console.log("Section analytics data reset");
    } catch (error) {
      console.error("Error resetting section analytics:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const sectionAnalyticsController = new SectionAnalyticsController();
