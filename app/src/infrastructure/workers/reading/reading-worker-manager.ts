import {
  BaseWorkerManager,
  type WorkerManagerConfig,
} from "@/infrastructure/workers/base/base-worker-manager";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import type { CategoryBreakdown } from "@/stores/analytics/category-store";
import type { FileMetadata } from "@/services/document";
import { HistoryFilterOptions } from "@/services/reading/reading-history-filter";

export interface ReadingWorkerAPI {
  calculateCategoryBreakdown(
    readingHistory: ReadingHistoryItem[],
    availableDocuments: FileMetadata[]
  ): Promise<CategoryBreakdown[]>;

  createCategoryMap(
    readingHistory: ReadingHistoryItem[]
  ): Promise<Record<string, ReadingHistoryItem[]>>;

  filterHistory(
    readingHistory: ReadingHistoryItem[],
    filter: HistoryFilterOptions
  ): Promise<ReadingHistoryItem[]>;
}

/**
 * Analytics Worker Manager
 *
 * Manages background processing of reading analytics data including:
 * - Reading streak calculations
 * - Category breakdowns
 * - Activity patterns (daily, weekly, hourly)
 */
export class ReadingWorkerManager extends BaseWorkerManager<ReadingWorkerAPI> {
  constructor(config: WorkerManagerConfig = {}) {
    super(config);
  }

  protected createWorker(): Worker {
    return new Worker(new URL("./reading.worker.ts", import.meta.url), {
      type: "module",
    });
  }

  // Category breakdown
  public async calculateCategoryBreakdown(
    readingHistory: ReadingHistoryItem[],
    availableDocuments: FileMetadata[]
  ): Promise<CategoryBreakdown[]> {
    return this.executeTask((proxy) =>
      proxy.calculateCategoryBreakdown(readingHistory, availableDocuments)
    );
  }

  public async filterHistory(
    readingHistory: ReadingHistoryItem[],
    filter: HistoryFilterOptions
  ): Promise<ReadingHistoryItem[]> {
    return this.executeTask((proxy) =>
      proxy.filterHistory(readingHistory, filter)
    );
  }

  public async createCategoryMap(
    readingHistory: ReadingHistoryItem[]
  ): Promise<Record<string, ReadingHistoryItem[]>> {
    return this.executeTask((proxy) => proxy.createCategoryMap(readingHistory));
  }
}
