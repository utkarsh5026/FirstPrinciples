import CardContainer from "@/components/container/CardContainer";
import type { MonthlyDocumentCounts } from "@/services/analytics/heatmap-generator";
import { useHeatmapStore } from "@/stores";
import { TrendingUp } from "lucide-react";
import ReadingProgressAreaChart from "./ReadingProgressAreaChart";
import { useState, useEffect, useMemo } from "react";
import { formatRelativeTime } from "@/utils/time";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import type { Color } from "@/components/container/useContainer";

interface ReadingProgressProps {
  history: ReadingHistoryItem[];
  compact?: boolean;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({
  history,
  compact = false,
}) => {
  const getMonthlyDocumentCounts = useHeatmapStore(
    (state) => state.getMonthlyDocumentCounts
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyDocumentCounts>();

  useEffect(() => {
    const fetchMonthlyData = async () => {
      const currentMonth = new Date();
      const prevSixMonths = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 6,
        1
      );
      const data = await getMonthlyDocumentCounts(
        history,
        prevSixMonths,
        currentMonth
      );
      setMonthlyData(data);
    };
    fetchMonthlyData();
  }, [history, getMonthlyDocumentCounts]);

  const totalReadingEvents = useMemo(() => {
    return (
      monthlyData?.months.reduce((sum, month) => sum + month.count, 0) || 0
    );
  }, [monthlyData]);

  const mostActiveMonth = useMemo(() => {
    if (!monthlyData?.months.length) return null;
    return monthlyData.months.reduce(
      (max, month) => (month.count > max.count ? month : max),
      monthlyData.months[0]
    );
  }, [monthlyData]);

  const trend = useMemo(() => {
    if (!monthlyData || monthlyData.months.length < 2) return "stable";

    const lastMonth = monthlyData.months[monthlyData.months.length - 1];
    const previousMonth = monthlyData.months[monthlyData.months.length - 2];

    if (lastMonth.count > previousMonth.count * 1.2) return "increasing";
    if (lastMonth.count < previousMonth.count * 0.8) return "decreasing";
    return "stable";
  }, [monthlyData]);

  const insights = [
    {
      label: "Last active",
      value: formatRelativeTime(mostActiveMonth?.timestamp ?? 0),
    },
    {
      label: "Most active month",
      value: mostActiveMonth?.label ?? "N/A",
    },
    {
      label: "Trend",
      value:
        trend === "increasing"
          ? "↑ Increasing"
          : trend === "decreasing"
          ? "↓ Decreasing"
          : "→ Stable",
      highlight: true,
    },
    { label: "Total events", value: totalReadingEvents.toString() },
  ];

  const getColorAccordingToTrend = (trend: string): Color => {
    switch (trend) {
      case "increasing":
        return "green";
      case "decreasing":
        return "red";
      default:
        return "yellow";
    }
  };

  return (
    <CardContainer
      title="Reading Progress"
      insights={insights}
      description="Your reading progress over time"
      icon={TrendingUp}
      variant="subtle"
      compact={compact}
      baseColor={getColorAccordingToTrend(trend)}
    >
      {monthlyData?.months && (
        <ReadingProgressAreaChart monthlyData={monthlyData.months} />
      )}
    </CardContainer>
  );
};

export default ReadingProgress;
