import { fromSnakeToTitleCase } from "@/utils/string";
import { databaseService } from "@/infrastructure/storage";
import { readingSessionTracker } from "@/services/analytics/ReadingSessionTracker";
import { estimateWordsRead } from "@/services/analytics/word-count-estimation";

const STORE_NAME = "readingHistory";

/**
 * 📚 Reading History Service
 *
 * Tracks and manages your reading journey across documents.
 * Remembers what you've read, when you read it, and how much time you spent!
 */
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
 * 📝 Add a document to reading history
 *
 * Records that you've read something! Updates existing entries
 * or creates new ones to track your reading progress.
 */
export async function addToReadingHistory(
  path: string,
  title: string
): Promise<ReadingHistoryItem> {
  try {
    const existingEntries = await databaseService.getByIndex<
      ReadingHistoryItem & { id: IDBValidKey }
    >(STORE_NAME, "path", path);

    const existingEntry =
      existingEntries.length > 0 ? existingEntries[0] : null;

    const timeSpent = await readingSessionTracker.getTimeSpentOnDocument(
      path,
      true
    );
    const wordsRead = estimateWordsRead(timeSpent);
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
        STORE_NAME,
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

      const id = await databaseService.add(STORE_NAME, newEntry);
      return { ...newEntry, id: id as number };
    }
  } catch (error) {
    console.error("Error adding to reading history:", error);
    throw error;
  }
}

/**
 * 📋 Get all reading history items
 *
 * Fetches your complete reading history so you can see
 * everything you've been learning about!
 */
export async function getAllHistory(): Promise<ReadingHistoryItem[]> {
  try {
    const history = await databaseService.getAll<ReadingHistoryItem>(
      STORE_NAME
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
 * 🧹 Clear all reading history
 *
 * Wipes your reading slate clean! Sometimes you just
 * want to start fresh with tracking what you've read.
 */
export async function clearHistory(): Promise<void> {
  try {
    await databaseService.clearStore(STORE_NAME);
  } catch (error) {
    console.error("Error clearing reading history:", error);
    throw error;
  }
}

/**
 * 🔍 Get history item for a specific document
 *
 * Checks if you've read a particular document before
 * and retrieves your reading stats for it!
 */
export async function getDocumentHistory(
  path: string
): Promise<ReadingHistoryItem | null> {
  try {
    const items = await databaseService.getByIndex<ReadingHistoryItem>(
      STORE_NAME,
      "path",
      path
    );
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error("Error getting document history:", error);
    return null;
  }
}
