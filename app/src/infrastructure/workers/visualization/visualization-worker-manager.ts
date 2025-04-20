import {
  BaseWorkerManager,
  type WorkerManagerConfig,
} from "@/infrastructure/workers/base/base-worker-manager";
import type { ReadingHistoryItem } from "@/services/history";
import type {
  MonthlyData,
  MonthlyDocumentCounts,
} from "@/services/analytics/heatmap-generator";

export interface VisualizationWorkerAPI {
  // Heatmap data generation
  generateMonthlyHeatmapData(
    readingHistory: ReadingHistoryItem[],
    month: Date
  ): Promise<Omit<MonthlyData, "dataHash">>;

  // Document count visualizations
  generateMonthlyDocumentCounts(
    readingHistory: ReadingHistoryItem[],
    fromDate: Date,
    toDate: Date
  ): Promise<MonthlyDocumentCounts>;
}

/**
 * Visualization Worker Manager
 *
 * Manages background processing for data visualizations including:
 * - Heatmaps for reading activity
 * - Document count charts
 * - Reading analytics visualizations
 * - Monthly activity data
 */
export class VisualizationWorkerManager extends BaseWorkerManager<VisualizationWorkerAPI> {
  constructor(config: WorkerManagerConfig = {}) {
    super(config);
  }

  protected createWorker(): Worker {
    return new Worker(new URL("./visualization.worker.ts", import.meta.url), {
      type: "module",
    });
  }

  // Generate monthly heatmap data
  public async generateMonthlyHeatmapData(
    readingHistory: ReadingHistoryItem[],
    month: Date
  ): Promise<Omit<MonthlyData, "dataHash">> {
    return this.executeTask((proxy) =>
      proxy.generateMonthlyHeatmapData(readingHistory, month)
    );
  }

  // Generate monthly document counts
  public async generateMonthlyDocumentCounts(
    readingHistory: ReadingHistoryItem[],
    fromDate: Date,
    toDate: Date
  ): Promise<MonthlyDocumentCounts> {
    return this.executeTask((proxy) =>
      proxy.generateMonthlyDocumentCounts(readingHistory, fromDate, toDate)
    );
  }
}
