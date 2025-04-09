// src/services/analytics/ReadingHistoryService.ts

import { databaseService } from "../database/DatabaseService";
import { readingSessionTracker } from "./ReadingSessionTracker";
import { wordCountEstimator } from "./WordCountEstimator";

export interface ReadingHistoryItem {
  id?: number;
  path: string;
  title: string;
  lastReadAt: number;
  readCount: number;
  timeSpent: number;
  wordsRead: number;
}

/**
 * Service that manages reading history and related analytics
 */
export class ReadingHistoryService {
  /**
   * Add a document to reading history
   * @param path Document path
   * @param title Document title
   * @param content Optional document content for word counting
   * @returns Promise with the added or updated history item
   */
  public async addToReadingHistory(
    path: string,
    title: string,
    content?: string
  ): Promise<ReadingHistoryItem> {
    try {
      // Get existing history entries for this document
      const existingEntries =
        await databaseService.getByIndex<ReadingHistoryItem>(
          "readingHistory",
          "path",
          path
        );

      const existingEntry =
        existingEntries.length > 0 ? existingEntries[0] : null;

      // Calculate words read
      let wordCount = 0;
      if (content) {
        wordCount = wordCountEstimator.countWords(content);
      }

      // Get actual time spent on this document from the session tracker
      const timeSpent = await readingSessionTracker.getTimeSpentOnDocument(
        path,
        true
      );
      const wordsRead = wordCountEstimator.estimateWordsRead(timeSpent);

      const now = Date.now();

      if (existingEntry) {
        // Update existing entry
        const updatedEntry: ReadingHistoryItem = {
          ...existingEntry,
          lastReadAt: now,
          readCount: existingEntry.readCount + 1,
          timeSpent: existingEntry.timeSpent + timeSpent,
          wordsRead: existingEntry.wordsRead + wordsRead,
        };

        await databaseService.update("readingHistory", updatedEntry);
        return updatedEntry;
      } else {
        // Create new entry
        const newEntry: ReadingHistoryItem = {
          path,
          title,
          lastReadAt: now,
          readCount: 1,
          timeSpent: timeSpent,
          wordsRead: wordsRead,
        };

        const id = await databaseService.add("readingHistory", newEntry);
        return { ...newEntry, id: id as number };
      }
    } catch (error) {
      console.error("Error adding to reading history:", error);
      throw error;
    }
  }

  /**
   * Get all reading history items
   * @returns Promise with array of all history items
   */
  public async getAllHistory(): Promise<ReadingHistoryItem[]> {
    try {
      return await databaseService.getAll<ReadingHistoryItem>("readingHistory");
    } catch (error) {
      console.error("Error getting reading history:", error);
      return [];
    }
  }

  /**
   * Clear all reading history
   * @returns Promise that resolves when history is cleared
   */
  public async clearHistory(): Promise<void> {
    try {
      await databaseService.clearStore("readingHistory");
    } catch (error) {
      console.error("Error clearing reading history:", error);
      throw error;
    }
  }

  /**
   * Get history item for a specific document
   * @param path Document path
   * @returns Promise with history item or null if not found
   */
  public async getDocumentHistory(
    path: string
  ): Promise<ReadingHistoryItem | null> {
    try {
      const items = await databaseService.getByIndex<ReadingHistoryItem>(
        "readingHistory",
        "path",
        path
      );
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error("Error getting document history:", error);
      return null;
    }
  }

  /**
   * Calculate total time spent reading across all documents
   * @returns Promise with total time in milliseconds
   */
  public async getTotalReadingTime(): Promise<number> {
    try {
      const history = await this.getAllHistory();
      return history.reduce((total, item) => total + item.timeSpent, 0);
    } catch (error) {
      console.error("Error calculating total reading time:", error);
      return 0;
    }
  }

  /**
   * Calculate total words read across all documents
   * @returns Promise with total words read
   */
  public async getTotalWordsRead(): Promise<number> {
    try {
      const history = await this.getAllHistory();
      return history.reduce((total, item) => total + item.wordsRead, 0);
    } catch (error) {
      console.error("Error calculating total words read:", error);
      return 0;
    }
  }
}

// Create and export a singleton instance
export const readingHistoryService = new ReadingHistoryService();
