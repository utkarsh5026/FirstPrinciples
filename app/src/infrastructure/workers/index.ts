import { AnalyticsWorkerManager } from "@/infrastructure/workers/analytics/analytics-worker-manager";
import { MarkdownWorkerManager } from "@/infrastructure/workers/markdown/markdown-worker-manager";
import { VisualizationWorkerManager } from "@/infrastructure/workers/visualization/visualization-worker-manager";
import { SectionWorkerManager } from "@/infrastructure/workers/section/section-worker-manager";
import { ReadingWorkerManager } from "@/infrastructure/workers/reading/reading-worker-manager";

const analyticsWorkerManager = new AnalyticsWorkerManager();
const markdownWorkerManager = new MarkdownWorkerManager();
const visualizationWorkerManager = new VisualizationWorkerManager();
const sectionWorkerManager = new SectionWorkerManager();
const readingWorkerManager = new ReadingWorkerManager();

export {
  analyticsWorkerManager,
  markdownWorkerManager,
  visualizationWorkerManager,
  sectionWorkerManager,
  readingWorkerManager,
};
