import { databaseService } from "@/services/database/DatabaseService";

/**
 * Interface for section reading data stored in IndexedDB
 */
export type SectionReadingData = {
  id?: IDBValidKey;
  documentPath: string; // Path to the document being read
  sectionId: string; // ID of the section being read
  timeSpent: number; // Time spent on the section in milliseconds
  lastReadAt: number; // Timestamp when the section was last read
};

/**
 * SectionReadingService
 *
 * A dedicated service for tracking section reading activity.
 * This service:
 * - Marks sections as read immediately when opened
 * - Records time spent on each section
 * - Stores this data in IndexedDB
 * - Provides methods to query reading status and history
 */
/**
 * 📚 SectionReadingService
 *
 * A friendly service that keeps track of your reading progress! ✨
 *
 * This service is like your personal reading assistant that remembers:
 * - Which sections you've already read 👀
 * - How much time you've spent on each section ⏱️
 * - Your overall progress through documents 📊
 *
 * It quietly works in the background, storing all this information
 * in your browser's database so you can pick up right where you left off!
 * Think of it as leaving bookmarks and notes automatically as you read.
 */
export class SectionReadingService {
  private static readonly STORE_NAME = "sectionReadings";

  /**
   * 🚀 Initialize the service
   *
   * Gets everything ready to track your reading journey!
   */
  public async initialize(): Promise<void> {
    try {
      await databaseService.initDatabase();
    } catch (error) {
      console.error("Error initializing SectionReadingService:", error);
      throw error;
    }
  }

  /**
   * 📝 Record a section reading session
   *
   * Like a diary entry for your reading activity! Remembers that you
   * spent time on a specific section of a document.
   */
  public async recordSectionReading(
    documentPath: string,
    sectionId: string,
    timeSpent: number
  ): Promise<void> {
    try {
      // Only record if time spent is significant (> 500ms)
      if (timeSpent < 500) return;

      await databaseService.add(SectionReadingService.STORE_NAME, {
        documentPath,
        sectionId,
        timeSpent,
        lastReadAt: Date.now(),
      });
    } catch (error) {
      console.error("Error recording section reading:", error);
      throw error;
    }
  }

  /**
   * 🔍 Get all section reading data for a document
   *
   * Retrieves your complete reading history for a specific document.
   * Like checking your reading journal! 📔
   */
  public async getDocumentSectionReadings(
    documentPath: string
  ): Promise<SectionReadingData[]> {
    try {
      return await databaseService.getByIndex<SectionReadingData>(
        SectionReadingService.STORE_NAME,
        "documentPath",
        documentPath
      );
    } catch (error) {
      console.error("Error getting document section readings:", error);
      return [];
    }
  }

  /**
   * ✅ Get all read section IDs for a document
   *
   * Creates a checklist of all the sections you've already visited.
   * Like collecting stamps for each place you've been! 💌
   */
  public async getReadSections(documentPath: string): Promise<Set<string>> {
    try {
      const readings = await this.getDocumentSectionReadings(documentPath);

      // Extract unique section IDs
      const readSections = new Set<string>();
      readings.forEach((reading) => {
        readSections.add(reading.sectionId);
      });

      return readSections;
    } catch (error) {
      console.error("Error getting read sections:", error);
      return new Set<string>();
    }
  }

  /**
   * ⏱️ Get total time spent on a document
   *
   * Adds up all your reading sessions to see how long you've spent
   * with this document. Like a fitness tracker, but for reading! 🧠
   */
  public async getTotalTimeSpent(documentPath: string): Promise<number> {
    try {
      const readings = await this.getDocumentSectionReadings(documentPath);
      return readings.reduce((total, reading) => total + reading.timeSpent, 0);
    } catch (error) {
      console.error("Error calculating total time spent:", error);
      return 0;
    }
  }

  /**
   * 📊 Calculate document completion percentage
   *
   * Shows how much of the document you've explored!
   * Like a progress bar for your reading adventure! 🎮
   */
  public async getCompletionPercentage(
    documentPath: string,
    totalSections: number
  ): Promise<number> {
    try {
      if (totalSections <= 0) return 0;

      const readSections = await this.getReadSections(documentPath);
      return Math.round((readSections.size / totalSections) * 100);
    } catch (error) {
      console.error("Error calculating completion percentage:", error);
      return 0;
    }
  }

  /**
   * 👀 Check if a specific section has been read
   *
   * Tells you if you've already visited a particular section.
   * Like checking if you've already seen that episode! 🍿
   */
  public async isSectionRead(
    documentPath: string,
    sectionId: string
  ): Promise<boolean> {
    try {
      const readings = await databaseService.getByIndex<SectionReadingData>(
        SectionReadingService.STORE_NAME,
        "sectionId",
        sectionId
      );

      // Check if any of the readings are for this document
      return readings.some((reading) => reading.documentPath === documentPath);
    } catch (error) {
      console.error("Error checking if section is read:", error);
      return false;
    }
  }

  /**
   * 🧹 Clear all reading data for a document
   *
   * Wipes the slate clean for a fresh start with a document.
   * Like erasing your footprints in the sand! 🏖️
   */
  public async clearDocumentReadings(documentPath: string): Promise<void> {
    try {
      const readings = await this.getDocumentSectionReadings(documentPath);

      // Delete each reading
      for (const reading of readings) {
        if (reading.id) {
          await databaseService.delete(
            SectionReadingService.STORE_NAME,
            reading.id
          );
        }
      }
    } catch (error) {
      console.error("Error clearing document readings:", error);
      throw error;
    }
  }
}

export const sectionReadingService = new SectionReadingService();
