import { AnalyticsWorkerManager } from "./analytics/AnalyticsWorkerManager";
import { MarkdownWorkerManager } from "./markdown/MarkdownWorkerManager";

const analyticsWorkerManager = new AnalyticsWorkerManager();
const markdownWorkerManager = new MarkdownWorkerManager();

export { analyticsWorkerManager, markdownWorkerManager };
