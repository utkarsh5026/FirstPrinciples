import { AnalyticsWorkerManager } from "@/infrastructure/workers/analytics/analytics-worker-manager";
import { MarkdownWorkerManager } from "@/infrastructure/workers/markdown/markdown-worker-manager";
import { VisualizationWorkerManager } from "@/infrastructure/workers/visualization/visualization-worker-manager";

const analyticsWorkerManager = new AnalyticsWorkerManager();
const markdownWorkerManager = new MarkdownWorkerManager();
const visualizationWorkerManager = new VisualizationWorkerManager();

export {
  analyticsWorkerManager,
  markdownWorkerManager,
  visualizationWorkerManager,
};
