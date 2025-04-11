import { DocumentManagerProvider } from "./document/DocumentProvider";
import { AchievementsProvider } from "./achievments/AchievmentsProvider";
import { ReadingListProvider } from "./reading_list/ReadingProvider";
import { ReadingHistoryProvider } from "./history/HistoryProvider";
import { ReadingMetricsProvider } from "./metrics/MetricsProvider";
import { ServicesProvider } from "./services/ServiceProvider";

import { useDocumentManager } from "./document/DocumentContext";
import { useAchievements } from "./achievments/AchievmentsContext";
import { useReadingList } from "./reading_list/ReadingContext";
import { useReadingHistory } from "./history/HistoryContext";
import { useReadingMetrics } from "./metrics/MetricsContext";
import { useServices } from "./services/ServiceContext";

export {
  DocumentManagerProvider,
  AchievementsProvider,
  ReadingListProvider,
  ReadingHistoryProvider,
  ReadingMetricsProvider,
  ServicesProvider,
  useDocumentManager,
  useAchievements,
  useReadingList,
  useReadingHistory,
  useReadingMetrics,
  useServices,
};
