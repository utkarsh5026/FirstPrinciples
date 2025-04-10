import { ServicesContext, type ServicesContextType } from "./ServiceContext";
import { ReactNode, useEffect, useMemo, useState } from "react";
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
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

  useEffect(() => {
    const initializeServices = async () => {
      try {
        // First, initialize the database
        await databaseService.initDatabase();
        console.log("Database initialized successfully");

        // Then initialize the analytics controller which depends on the database
        await analyticsController.initialize();
        console.log("Analytics services initialized successfully");

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize services:", error);
        setInitError(
          error instanceof Error
            ? error
            : new Error("Unknown initialization error")
        );
      }
    };

    initializeServices();
  }, []);

  // Show a simple loading state while services are initializing
  if (!isInitialized && !initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Initializing application...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="max-w-md p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-destructive mb-4">
            Initialization Error
          </h2>
          <p className="mb-4">
            There was a problem initializing the application:
          </p>
          <div className="bg-muted p-3 rounded mb-4 overflow-auto max-h-40">
            <code>{initError.message}</code>
          </div>
          <p className="mb-4">
            Please try refreshing the page or contact support if the issue
            persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ServicesContext.Provider value={serviceValues}>
      {children}
    </ServicesContext.Provider>
  );
};
