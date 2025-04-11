// src/context/GlobalProvider.tsx
import React, { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/context/ThemeProvider";
import { ServicesProvider } from "@/context/services/ServiceProvider";
import { ReadingHistoryProvider } from "@/context/history/HistoryProvider";
import { ReadingListProvider } from "@/context/reading_list/ReadingProvider";
import { ReadingMetricsProvider } from "@/context/metrics/MetricsProvider";
import { AchievementsProvider } from "@/context/achievments/AchievmentsProvider";
import { DocumentManagerProvider } from "@/context/document/DocumentProvider";

interface GlobalProvidersProps {
  children: ReactNode;
  onSelectFile: (path: string) => void;
}

/**
 * GlobalProviders - A wrapper component that combines all providers
 *
 * This component organizes all providers in the correct nesting order,
 * ensuring that dependencies between contexts are respected.
 *
 * Provider nesting order is important:
 * 1. Theme provider (for UI theming)
 * 2. Services provider (for core services)
 * 3. Domain-specific providers (reading, achievements, etc.)
 */
export const GlobalProviders: React.FC<GlobalProvidersProps> = ({
  children,
  onSelectFile,
}) => {
  return (
    <ThemeProvider>
      <ServicesProvider>
        <ReadingMetricsProvider>
          <ReadingHistoryProvider>
            <ReadingListProvider>
              <AchievementsProvider>
                <DocumentManagerProvider onSelectFile={onSelectFile}>
                  {children}
                </DocumentManagerProvider>
              </AchievementsProvider>
            </ReadingListProvider>
          </ReadingHistoryProvider>
        </ReadingMetricsProvider>
      </ServicesProvider>
    </ThemeProvider>
  );
};

export default GlobalProviders;
