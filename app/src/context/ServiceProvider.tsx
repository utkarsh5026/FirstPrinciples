import { ServicesContext, type ServicesContextType } from "./ServiceContext";
import { ReactNode, useMemo } from "react";
import { databaseService } from "@/services/database/DatabaseService";
import { readingListService } from "@/services/analytics/ReadingListService";
import { readingHistoryService } from "@/services/analytics/ReadingHistoryService";
import { readingStatsService } from "@/services/analytics/ReadingStatsService";
import { analyticsController } from "@/services/analytics/AnalyticsController";
import { sectionAnalyticsController } from "@/services/analytics/SectionAnalyticsController";
import { readingSessionTracker } from "@/services/analytics/ReadingSessionTracker";
import { sectionReadingTracker } from "@/services/analytics/SectionReadingTracker";
import { wordCountEstimator } from "@/services/analytics/WordCountEstimator";

interface ServicesProviderProps {
  children: ReactNode;
}

/**
 * 🎉 The ServicesProvider component is like a magical box that holds all the essential services
 * needed for our application! It makes these services available to any component that needs them,
 * ensuring that everything runs smoothly and efficiently. 🌟
 *
 * 🛠️ Inside, we gather various services such as database management, reading analytics, and
 * session tracking, all wrapped up in a neat package. This way, components can easily access
 * the tools they need without any hassle! 🚀
 *
 * 💡 By using the useMemo hook, we ensure that our services are only created once,
 * optimizing performance and preventing unnecessary re-renders. This keeps our app
 * fast and responsive! ⚡
 */
export const ServicesProvider: React.FC<ServicesProviderProps> = ({
  children,
}) => {
  const serviceValues: ServicesContextType = useMemo(
    () => ({
      databaseService,
      readingListService,
      readingHistoryService,
      readingStatsService,
      analyticsController,
      sectionAnalyticsController,
      readingSessionTracker,
      sectionReadingTracker,
      wordCountEstimator,
    }),
    []
  );

  return (
    <ServicesContext.Provider value={serviceValues}>
      {children}
    </ServicesContext.Provider>
  );
};
