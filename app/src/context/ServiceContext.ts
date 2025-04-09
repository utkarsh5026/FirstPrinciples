import { createContext, useContext } from "react";
import { databaseService } from "@/services/database/DatabaseService";
import { readingListService } from "@/services/analytics/ReadingListService";
import { readingHistoryService } from "@/services/analytics/ReadingHistoryService";
import { readingStatsService } from "@/services/analytics/ReadingStatsService";
import { analyticsController } from "@/services/analytics/AnalyticsController";
import { sectionAnalyticsController } from "@/services/analytics/SectionAnalyticsController";
import { readingSessionTracker } from "@/services/analytics/ReadingSessionTracker";
import { sectionReadingTracker } from "@/services/analytics/SectionReadingTracker";
import { wordCountEstimator } from "@/services/analytics/WordCountEstimator";

/**
 * This type defines the shape of our Services Context, which holds
 * various services that our application can use. 🌟
 *
 * It includes services for managing the database, tracking reading
 * history, handling reading stats, and more! Each service plays a
 * crucial role in providing the necessary functionality for our
 * analytics system. 📚✨
 */
export type ServicesContextType = {
  databaseService: typeof databaseService;
  readingListService: typeof readingListService;
  readingHistoryService: typeof readingHistoryService;
  readingStatsService: typeof readingStatsService;
  analyticsController: typeof analyticsController;
  sectionAnalyticsController: typeof sectionAnalyticsController;
  readingSessionTracker: typeof readingSessionTracker;
  sectionReadingTracker: typeof sectionReadingTracker;
  wordCountEstimator: typeof wordCountEstimator;
};

/**
 * The ServicesContext is a React context that provides access to
 * various services throughout the application. 🌈
 *
 * By using this context, components can easily access the services
 * they need without having to pass them down through props. This
 * promotes cleaner and more maintainable code! 🎉
 */
export const ServicesContext = createContext<ServicesContextType | null>(null);

/**
 * The useServices hook allows components to consume the ServicesContext
 * easily. 🛠️
 *
 * It ensures that the context is available and throws an error if
 * used outside of a ServicesProvider. This helps to prevent bugs
 * and ensures that components have access to the necessary services
 * for their functionality. 🚀
 */
export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
};
