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
 * Service that manages reading lists/todo items
 */
export class ReadingListService {
  /**
   * Add a document to the reading list
   * @param path Document path
   * @param title Document title
   * @returns Promise with a boolean indicating success
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
   * Get all reading list items
   * @returns Promise with array of all todo items
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
   * Get a specific reading list item
   * @param id Item ID
   * @returns Promise with the item or null if not found
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
  // src/services/analytics/ReadingListService.ts (continued)

  /**
   * Toggle completion status of a reading list item
   * @param id Item ID
   * @returns Promise with the updated item or null if not found
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
   * Remove an item from the reading list
   * @param id Item ID
   * @returns Promise with a boolean indicating success
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
   * Clear all items from the reading list
   * @returns Promise that resolves when the list is cleared
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
   * Get completion statistics for the reading list
   * @returns Promise with completion stats
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
