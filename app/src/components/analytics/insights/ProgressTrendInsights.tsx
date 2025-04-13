import { useReadingMetrics } from "@/context";
import { formatRelativeTime } from "@/utils/time";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { ProgressOverTime } from "../trends";
import InsightCard from "./InsightCard";

/**
 * ProgressTrendInsightCard - Shows reading progress over time
 *
 * This component visualizes the user's reading activity trends over time,
 * showing their consistency and growth patterns.
 */
export const ProgressTrendInsightCard = () => {
  const { metrics, monthlyData } = useReadingMetrics();

  const totalReadingEvents = useMemo(() => {
    return monthlyData?.reduce((sum, month) => sum + month.count, 0) || 0;
  }, [monthlyData]);

  const mostActiveMonth = useMemo(() => {
    if (!monthlyData?.length) return null;
    return monthlyData.reduce(
      (max, month) => (month.count > max.count ? month : max),
      monthlyData[0]
    );
  }, [monthlyData]);

  const trend = useMemo(() => {
    if (!monthlyData || monthlyData.length < 2) return "stable";

    const lastMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

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
      value: formatRelativeTime(metrics.lastReadAt ?? 0),
    },
    {
      label: "Most active month",
      value: mostActiveMonth?.name ?? "N/A",
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
        <ProgressOverTime />
      </div>
    </InsightCard>
  );
};
