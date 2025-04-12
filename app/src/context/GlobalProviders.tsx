import React, { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/context/ThemeProvider";
import { ServicesProvider } from "@/context/services/ServiceProvider";
import { ReadingHistoryProvider } from "@/context/history/HistoryProvider";
import { ReadingListProvider } from "@/context/reading_list/ReadingProvider";
import { ReadingMetricsProvider } from "@/context/metrics/MetricsProvider";
import { EnhancedAchievementsProvider } from "@/context/achievments/AchievmentsProvider";
import { XPProvider } from "@/context/xp/XpProvider";
import { DocumentManagerProvider } from "@/context/document/DocumentProvider";
import AnalyticsProvider from "./analytics/AnalyticsProvider";

interface GlobalProvidersProps {
  children: ReactNode;
  onSelectFile: (path: string) => void;
}

export const GlobalProviders: React.FC<GlobalProvidersProps> = ({
  children,
  onSelectFile,
}) => {
  return (
    <ThemeProvider>
      <ServicesProvider>
        <ReadingHistoryProvider>
          <ReadingMetricsProvider>
            <ReadingListProvider>
              <XPProvider>
                <EnhancedAchievementsProvider>
                  <DocumentManagerProvider onSelectFile={onSelectFile}>
                    <AnalyticsProvider>{children}</AnalyticsProvider>
                  </DocumentManagerProvider>
                </EnhancedAchievementsProvider>
              </XPProvider>
            </ReadingListProvider>
          </ReadingMetricsProvider>
        </ReadingHistoryProvider>
      </ServicesProvider>
    </ThemeProvider>
  );
};

export default GlobalProviders;
