import { ReadingSessionTracker } from "./ReadingSessionTracker";
import { wordCountEstimator } from "./WordCountEstimator";
import { databaseService } from "../database/DatabaseService";

export type SectionReadingData = {
  sectionId: string;
  documentPath: string;
  sectionTitle: string;
  sectionIndex: number;
  startTime: number;
  endTime: number | null;
  duration: number | null;
  wordCount: number;
  isComplete: boolean;
};

export type DocumentStats = {
  completionPercentage: number;
  lastReadAt: number;
  path: string;
};

/**
 * 📚 SectionReadingTracker
 *
 * Tracks user reading progress through document sections! This class helps monitor
 * how users interact with content, tracking which sections they've read and for how long.
 *
 * It automatically:
 * - Records time spent on each section
 * - Calculates if a section was read completely
 * - Updates overall document completion percentages
 * - Manages reading sessions across document sections
 *
 * Perfect for analytics and helping users keep track of their reading progress! 🎯
 */
export class SectionReadingTracker {
  private currentSection: SectionReadingData | null = null;
  private readonly sessionTracker: ReadingSessionTracker;

  constructor() {
    this.sessionTracker = new ReadingSessionTracker();
  }

  /**
   * 🏁 Start tracking a specific section
   *
   * Begins monitoring user's reading activity for a specific section.
   * If user was already reading another section, that one is automatically
   * ended first. Also starts a document session if this is the first section.
   */
  public startSectionReading(
    documentPath: string,
    sectionId: string,
    sectionTitle: string,
    sectionIndex: number,
    sectionContent: string
  ): void {
    if (this.currentSection) {
      this.endSectionReading();
    }
    const wordCount = wordCountEstimator.countWords(sectionContent);

    this.currentSection = {
      sectionId,
      documentPath,
      sectionTitle,
      sectionIndex,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      wordCount,
      isComplete: false,
    };

    if (sectionIndex === 0) {
      this.sessionTracker.startSession(documentPath, sectionTitle, wordCount);
    }
  }

  /**
   * 🏁 End tracking the current section
   *
   * Finishes monitoring the current section, calculates reading duration,
   * determines if the section was read completely, and saves all this data.
   * Also updates the overall document completion percentage.
   */
  public async endSectionReading(
    markComplete = false
  ): Promise<SectionReadingData | null> {
    if (!this.currentSection) {
      return null;
    }
    const now = Date.now();

    this.currentSection.endTime = now;
    this.currentSection.duration = now - this.currentSection.startTime;
    const estimatedTimeNeeded = wordCountEstimator.estimateReadingTime(
      this.currentSection.wordCount
    );

    if (
      markComplete ||
      this.currentSection.duration > estimatedTimeNeeded * 0.7
    ) {
      this.currentSection.isComplete = true;
    }

    try {
      await databaseService.add("sectionReadings", this.currentSection);
      await this.updateDocumentCompletion(this.currentSection.documentPath);
      const completedSection = { ...this.currentSection };
      this.currentSection = null;
      return completedSection;
    } catch (error) {
      console.error("Error saving section reading data:", error);
      return null;
    }
  }

  /**
   * 📊 Update document completion percentage
   *
   * Calculates how much of the document has been read based on completed sections
   * and updates this information in the database for progress tracking.
   */
  private async updateDocumentCompletion(documentPath: string): Promise<void> {
    try {
      const allSections = await databaseService.getByIndex<SectionReadingData>(
        "sectionReadings",
        "documentPath",
        documentPath
      );

      const completedSections = allSections.filter(
        (section) => section.isComplete
      ).length;
      const totalSections = new Set(allSections.map((s) => s.sectionId)).size;

      if (totalSections > 0) {
        const completionPercentage = (completedSections / totalSections) * 100;

        try {
          const docStats = await databaseService.getByKey<DocumentStats>(
            "documentStats",
            documentPath
          );

          if (docStats) {
            await databaseService.update("documentStats", {
              ...docStats,
              id: documentPath,
              completionPercentage: completionPercentage,
              lastReadAt: Date.now(),
            });
          } else {
            await databaseService.add("documentStats", {
              path: documentPath,
              id: documentPath,
              completionPercentage: completionPercentage,
              lastReadAt: Date.now(),
            });
          }
        } catch (error) {
          console.error("Error updating document stats:", error);
        }
      }
    } catch (error) {
      console.error("Error updating document completion:", error);
    }
  }

  /**
   * 📏 Check current section reading progress
   *
   * Provides a percentage (0-100) of how much of the current section
   * has likely been read based on time spent compared to estimated reading time.
   * Great for showing progress bars! ⏱️
   */
  public checkSectionProgress(): number {
    if (!this.currentSection) return 0;

    const estimatedTimeNeeded = wordCountEstimator.estimateReadingTime(
      this.currentSection.wordCount
    );

    const timeSpent = Date.now() - this.currentSection.startTime;
    return Math.min(100, Math.round((timeSpent / estimatedTimeNeeded) * 100));
  }
}

export const sectionReadingTracker = new SectionReadingTracker();
