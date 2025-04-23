import * as Comlink from "comlink";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import type { CategoryBreakdown } from "@/stores/categoryStore";
import {
  createCategoryBreakdown,
  createCategoryMap,
} from "@/services/analytics/category-analytics";
import type { FileMetadata } from "@/services/document";
import {
  filterHistory,
  type HistoryFilterOptions,
} from "@/services/reading/reading-history-filter";

class ReadingWorker {
  /**
   * Calculate category breakdown statistics
   */
  calculateCategoryBreakdown(
    readingHistory: ReadingHistoryItem[],
    availableDocuments: FileMetadata[]
  ): CategoryBreakdown[] {
    return createCategoryBreakdown(readingHistory, availableDocuments);
  }

  /**
   * Create a category map
   */
  createCategoryMap(
    readingHistory: ReadingHistoryItem[]
  ): Record<string, ReadingHistoryItem[]> {
    return createCategoryMap(readingHistory);
  }

  filterHistory(
    readingHistory: ReadingHistoryItem[],
    filter: HistoryFilterOptions
  ): ReadingHistoryItem[] {
    return filterHistory(readingHistory, filter);
  }
}

Comlink.expose(new ReadingWorker());

export {};
