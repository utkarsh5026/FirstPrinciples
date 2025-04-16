import { formatRelativeTime } from "@/utils/time";
import { TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProgressOverTime } from "../trends";
import InsightCard from "./InsightCard";
import { useHeatmapStore, useHistoryStore } from "@/stores";
import { MonthlyDocumentCounts } from "@/stores/heatmapStore";

/**
 * ProgressTrendInsightCard - Shows reading progress over time
 *
 * This component visualizes the user's reading activity trends over time,
 * showing their consistency and growth patterns.
 */
export const ProgressTrendInsightCard = () => {
  const readingHistory = useHistoryStore((state) => state.readingHistory);
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
        readingHistory,
        prevSixMonths,
        currentMonth
      );
      setMonthlyData(data);
    };
    fetchMonthlyData();
  }, [readingHistory, getMonthlyDocumentCounts]);

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

  // Color by trend
  const trendGradient =
    trend === "increasing"
      ? "from-green-500/5 to-green-500/10"
      : trend === "decreasing"
      ? "from-red-500/5 to-red-500/10"
      : "from-yellow-500/5 to-yellow-500/10"; // stable

  const trendIconColor =
    trend === "increasing"
      ? "text-green-500"
      : trend === "decreasing"
      ? "text-red-500"
      : "text-yellow-500"; // stable

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

  return (
    <InsightCard
      title="Reading Progress"
      description="Your reading activity trends over time"
      icon={TrendingUp}
      insights={insights}
      gradient={trendGradient}
      iconColor={trendIconColor}
      delay={0.2}
    >
      <div className="h-60 w-full">
        {monthlyData?.months && (
          <ProgressOverTime monthlyData={monthlyData.months} />
        )}
      </div>
    </InsightCard>
  );
};
