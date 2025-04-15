import { databaseService } from "@/services/database/DatabaseService";

/**
 * Interface for section reading data stored in IndexedDB
 */
export interface SectionReadingData {
  id?: IDBValidKey;
  documentPath: string; // Path to the document being read
  sectionId: string; // ID of the section being read
  timeSpent: number; // Time spent on the section in milliseconds
  lastReadAt: number; // Timestamp when the section was last read
}

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
export class SectionReadingService {
  private static readonly STORE_NAME = "sectionReadings";

  /**
   * Initialize the service, ensuring the database is ready
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
   * Record a section reading session
   *
   * @param documentPath Path to the document
   * @param sectionId ID of the section read
   * @param timeSpent Time spent reading in milliseconds
   * @returns Promise that resolves when data is saved
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
   * Get all section reading data for a document
   *
   * @param documentPath Path to the document
   * @returns Promise with array of section reading data
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
   * Get all read section IDs for a document
   *
   * @param documentPath Path to the document
   * @returns Promise with set of section IDs that have been read
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
   * Get total time spent on a document
   *
   * @param documentPath Path to the document
   * @returns Promise with total time spent in milliseconds
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
   * Calculate document completion percentage
   *
   * @param documentPath Path to the document
   * @param totalSections Total number of sections in the document
   * @returns Promise with completion percentage (0-100)
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
   * Check if a specific section has been read
   *
   * @param documentPath Path to the document
   * @param sectionId ID of the section to check
   * @returns Promise with boolean indicating if section has been read
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
   * Clear all reading data for a document
   *
   * @param documentPath Path to the document
   * @returns Promise that resolves when data is cleared
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

// Create and export singleton instance
export const sectionReadingService = new SectionReadingService();
