import * as Comlink from "comlink";
import type { ReadingHistoryItem } from "@/services/history";
import {
  MonthlyData,
  MonthlyDocumentCounts,
  generateMonthlyHeatmapData,
  calculateMonthlyDocumentCounts,
} from "@/services/analytics/heatmap-generator";

class VisualizationWorker {
  /**
   * Generate monthly heatmap data for reading activity
   */
  generateMonthlyHeatmapData(
    readingHistory: ReadingHistoryItem[],
    month: Date
  ): MonthlyData {
    return generateMonthlyHeatmapData(readingHistory, month);
  }

  /**
   * Generate document counts by month
   */
  generateMonthlyDocumentCounts(
    readingHistory: ReadingHistoryItem[],
    fromDate: Date,
    toDate: Date
  ): MonthlyDocumentCounts {
    return calculateMonthlyDocumentCounts(readingHistory, fromDate, toDate);
  }
}

Comlink.expose(new VisualizationWorker());

export {};
