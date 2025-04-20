import { fromSnakeToTitleCase } from "@/utils/string";
import { databaseService } from "../database/DatabaseService";
import { readingSessionTracker } from "@/services/analytics/ReadingSessionTracker";
import { wordCountEstimator } from "@/services/analytics/WordCountEstimator";

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
 * Add a document to reading history
 * @param path Document path
 * @param title Document title
 * @returns Promise with the added or updated history item
 */
export async function addToReadingHistory(
  path: string,
  title: string
): Promise<ReadingHistoryItem> {
  try {
    // Get existing history entries for this document
    const existingEntries = await databaseService.getByIndex<
      ReadingHistoryItem & { id: IDBValidKey }
    >("readingHistory", "path", path);

    const existingEntry =
      existingEntries.length > 0 ? existingEntries[0] : null;

    const timeSpent = await readingSessionTracker.getTimeSpentOnDocument(
      path,
      true
    );
    const wordsRead = wordCountEstimator.estimateWordsRead(timeSpent);
    const now = Date.now();

    if (existingEntry) {
      const updatedEntry: ReadingHistoryItem = {
        ...existingEntry,
        lastReadAt: now,
        readCount: existingEntry.readCount + 1,
        timeSpent: existingEntry.timeSpent + timeSpent,
        wordsRead: existingEntry.wordsRead + wordsRead,
      };

      await databaseService.update(
        "readingHistory",
        updatedEntry as {
          id: IDBValidKey;
        }
      );
      return updatedEntry;
    } else {
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
export async function getAllHistory(): Promise<ReadingHistoryItem[]> {
  try {
    const history = await databaseService.getAll<ReadingHistoryItem>(
      "readingHistory"
    );
    return history.map((item) => ({
      ...item,
      title: fromSnakeToTitleCase(
        item.path.split("/").pop()?.replace(".md", "") ?? ""
      ),
    }));
  } catch (error) {
    console.error("Error getting reading history:", error);
    return [];
  }
}

/**
 * Clear all reading history
 * @returns Promise that resolves when history is cleared
 */
export async function clearHistory(): Promise<void> {
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
export async function getDocumentHistory(
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
