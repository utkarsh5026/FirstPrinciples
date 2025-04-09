// src/services/analytics/ReadingListService.ts

import { databaseService } from "../database/DatabaseService";

export interface ReadingTodoItem {
  id: string;
  path: string;
  title: string;
  addedAt: number;
  completed: boolean;
  completedAt: number | null;
}

/**
 * 📚 Reading List Service
 *
 * This service helps you keep track of documents you want to read later!
 * Think of it as your personal reading todo list for the app.
 *
 * ✅ Add documents to read later
 * 📝 Track what you've already read
 * 🗑️ Remove items you're no longer interested in
 * 📊 See how you're progressing through your reading list
 *
 * Perfect for building your own knowledge management system
 * by organizing what you want to read next.
 */
export class ReadingListService {
  /**
   * 📥 Add a document to your reading list
   *
   * Saves a document to read later, but only if it's not already in your list.
   */
  public async addToReadingList(path: string, title: string): Promise<boolean> {
    try {
      // Check if document is already in the list
      const existingItems = await databaseService.getByIndex<ReadingTodoItem>(
        "readingLists",
        "path",
        path
      );

      if (existingItems.length > 0) {
        return false; // Already in the list
      }

      // Create new todo item
      const newItem: ReadingTodoItem = {
        id: crypto.randomUUID(),
        path,
        title,
        addedAt: Date.now(),
        completed: false,
        completedAt: null,
      };

      await databaseService.add("readingLists", newItem);
      return true;
    } catch (error) {
      console.error("Error adding to reading list:", error);
      return false;
    }
  }

  /**
   * 📋 Get your entire reading list
   *
   * Fetches all the documents you've saved to read later.
   */
  public async getAllItems(): Promise<ReadingTodoItem[]> {
    try {
      return await databaseService.getAll<ReadingTodoItem>("readingLists");
    } catch (error) {
      console.error("Error getting reading list items:", error);
      return [];
    }
  }

  /**
   * 🔍 Find a specific reading list item
   *
   * Locates a particular document in your reading list.
   */
  public async getItem(id: string): Promise<ReadingTodoItem | null> {
    try {
      const item = await databaseService.getByKey<ReadingTodoItem>(
        "readingLists",
        id
      );
      return item || null;
    } catch (error) {
      console.error("Error getting reading list item:", error);
      return null;
    }
  }

  /**
   * ✅ Mark an item as read (or unread)
   *
   * Toggles whether you've completed reading a document.
   * Also tracks when you finished reading it!
   */
  public async toggleCompletion(id: string): Promise<ReadingTodoItem | null> {
    try {
      const item = await this.getItem(id);
      if (!item) {
        return null;
      }

      const updatedItem: ReadingTodoItem = {
        ...item,
        completed: !item.completed,
        completedAt: item.completed ? null : Date.now(),
      };

      await databaseService.update("readingLists", updatedItem);
      return updatedItem;
    } catch (error) {
      console.error("Error toggling completion status:", error);
      return null;
    }
  }

  /**
   * 🗑️ Remove something from your reading list
   *
   * Deletes a document from your reading list when you no longer
   * want to keep track of it.
   */
  public async removeItem(id: string): Promise<boolean> {
    try {
      await databaseService.delete("readingLists", id);
      return true;
    } catch (error) {
      console.error("Error removing item from reading list:", error);
      return false;
    }
  }

  /**
   * 🧹 Start fresh with an empty reading list
   *
   * Removes all items from your reading list in one go.
   */
  public async clearList(): Promise<void> {
    try {
      await databaseService.clearStore("readingLists");
    } catch (error) {
      console.error("Error clearing reading list:", error);
      throw error;
    }
  }

  /**
   * 📊 See how you're doing with your reading
   *
   * Shows you statistics about your reading progress,
   * like how many items you've read and how many are left.
   */
  public async getCompletionStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionPercentage: number;
  }> {
    try {
      const items = await this.getAllItems();
      const total = items.length;
      const completed = items.filter((item) => item.completed).length;
      const pending = total - completed;
      const completionPercentage =
        total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        total,
        completed,
        pending,
        completionPercentage,
      };
    } catch (error) {
      console.error("Error calculating completion stats:", error);
      return {
        total: 0,
        completed: 0,
        pending: 0,
        completionPercentage: 0,
      };
    }
  }
}

// Create and export a singleton instance
export const readingListService = new ReadingListService();
