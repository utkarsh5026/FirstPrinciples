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
  completedSectionIndices: number[]; // Array of section indices that have been completed
}

/**
 * 📝 Add a document to reading history
 *
 * Records that you've read something! Updates existing entries
 * or creates new ones to track your reading progress.
 */
export async function addToReadingHistory(
  path: string,
  title: string,
  completedSectionIndices?: number[]
): Promise<ReadingHistoryItem> {
  try {
    const existingEntries = await databaseService.getByIndex<
      ReadingHistoryItem & { id: IDBValidKey }
    >(STORE_NAME, "path", path);

    console.log("existingEntries", existingEntries);

    const existingEntry =
      existingEntries.length > 0 ? existingEntries[0] : null;

    const timeSpent = await readingSessionTracker.getTimeSpentOnDocument(
      path,
      true
    );
    const wordsRead = estimateWordsRead(timeSpent);
    const now = Date.now();

    if (existingEntry) {
      const currentCompletedSectionIndices =
        existingEntry.completedSectionIndices;
      const updatedCompletedSectionIndices = new Set([
        ...currentCompletedSectionIndices,
        ...(completedSectionIndices ?? []),
      ]);

      const updatedEntry: ReadingHistoryItem = {
        ...existingEntry,
        lastReadAt: now,
        readCount: existingEntry.readCount + 1,
        timeSpent: existingEntry.timeSpent + timeSpent,
        wordsRead: existingEntry.wordsRead + wordsRead,
        completedSectionIndices: Array.from(updatedCompletedSectionIndices),
      };

      console.log("existingEntry", existingEntry);
      console.log("updatedEntry", updatedEntry);

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
        completedSectionIndices: completedSectionIndices ?? [],
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

/**
 * Mark a section as completed for a document
 */
export async function markSectionsCompleted(
  path: string,
  title: string,
  sectionIndices: number[]
): Promise<boolean> {
  try {
    const entry = await getDocumentHistory(path);

    if (!entry) {
      await addToReadingHistory(path, title, sectionIndices);
      return true;
    }

    const { completedSectionIndices } = entry;

    const updatedSectionIndices = new Set([
      ...(completedSectionIndices || []),
      ...sectionIndices,
    ]);

    const updatedEntry: ReadingHistoryItem = {
      ...entry,
      lastReadAt: Date.now(),
      completedSectionIndices: Array.from(updatedSectionIndices),
    };

    await databaseService.update(
      STORE_NAME,
      updatedEntry as { id: IDBValidKey }
    );
    return true;
  } catch (error) {
    console.error("Error marking section as completed:", error);
    return false;
  }
}

/**
 * Check if a section has been completed
 */
export async function isSectionCompleted(
  path: string,
  sectionIndex: number
): Promise<boolean> {
  try {
    const documentHistory = await getDocumentHistory(path);
    if (!documentHistory?.completedSectionIndices) return false;

    return documentHistory.completedSectionIndices.includes(sectionIndex);
  } catch (error) {
    console.error("Error checking if section is completed:", error);
    return false;
  }
}

/**
 * Get all completed sections for a document
 */
export async function getCompletedSections(path: string): Promise<number[]> {
  try {
    const documentHistory = await getDocumentHistory(path);
    return documentHistory?.completedSectionIndices || [];
  } catch (error) {
    console.error("Error getting completed sections:", error);
    return [];
  }
}

/**
 * Calculate document completion percentage
 */
export async function getDocumentCompletionPercentage(
  path: string,
  totalSections: number
): Promise<number> {
  try {
    if (totalSections <= 0) return 0;

    const completedSections = await getCompletedSections(path);
    return Math.round((completedSections.length / totalSections) * 100);
  } catch (error) {
    console.error("Error calculating completion percentage:", error);
    return 0;
  }
}
