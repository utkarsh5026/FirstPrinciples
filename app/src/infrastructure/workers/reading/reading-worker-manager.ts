import {
  BaseWorkerManager,
  type WorkerManagerConfig,
} from "@/infrastructure/workers/base/base-worker-manager";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import type { CategoryBreakdown } from "@/stores/categoryStore";
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
    return new Worker(new URL("./analytics.worker.ts", import.meta.url), {
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
}
