import { ReactNode } from "react";
import { useReadingMetrics as useOriginalReadingMetrics } from "@/hooks/reading/useReadingMetrics";
import { ReadingMetricsContext } from "./MetricsContext";

interface ReadingMetricsProviderProps {
  children: ReactNode;
}

/**
 * ReadingMetricsProvider - Provides reading metrics state and functions to the component tree
 *
 * This provider centralizes all reading metrics calculations and data, making them
 * available to any component in the tree without recalculating.
 */
export const ReadingMetricsProvider: React.FC<ReadingMetricsProviderProps> = ({
  children,
}) => {
  // Use the original hook inside the provider
  const readingMetricsData = useOriginalReadingMetrics();

  // Provide the hook's return value as context
  return (
    <ReadingMetricsContext.Provider value={readingMetricsData}>
      {children}
    </ReadingMetricsContext.Provider>
  );
};
