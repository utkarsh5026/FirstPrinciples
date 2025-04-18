import { AnalyticsWorkerManager } from "./analytics/AnalyticsWorkerManager";
import { MarkdownWorkerManager } from "./markdown/MarkdownWorkerManager";
import { VisualizationWorkerManager } from "./visualization/VisualizationWorkerManager";

const analyticsWorkerManager = new AnalyticsWorkerManager();
const markdownWorkerManager = new MarkdownWorkerManager();
const visualizationWorkerManager = new VisualizationWorkerManager();

export {
  analyticsWorkerManager,
  markdownWorkerManager,
  visualizationWorkerManager,
};
