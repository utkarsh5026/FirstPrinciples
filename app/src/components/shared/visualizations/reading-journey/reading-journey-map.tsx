import React, { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import {
  Map,
  Milestone,
  Trophy,
  ArrowRight,
  Calendar,
  Activity,
} from "lucide-react";
import { useTheme } from "@/hooks/ui/use-theme";
import useMobile from "@/hooks/device/use-mobile";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import CardContainer from "@/components/shared/container/card-container";
import ChartContainer from "@/components/shared/chart/chart-container";
import {
  ChartContainer as ChartContainerUI,
  ChartTooltip,
} from "@/components/ui/chart";
import useChartTooltip from "@/components/shared/chart/tooltip/use-chart-tooltip";
import { cn } from "@/lib/utils";
import { useReadingHistory, useDocumentList } from "@/hooks";
interface ReadingJourneyMapProps {
  category?: string;
  compact?: boolean;
}

type TimelineDataPoint = {
  date: number;
  formattedDate: string;
  cumulativeCount: number;
  document?: {
    title: string;
    path: string;
  };
  isMilestone?: boolean;
  milestoneLabel?: string;
  milestoneDescription?: string;
};

type MilestoneData = {
  count: number;
  label: string;
  description?: string;
};

type JourneyData = {
  timeline: TimelineDataPoint[];
  milestones: MilestoneData[];
  recommendedPathway: MilestoneData[];
  stats: {
    totalRead: number;
    totalDocuments: number;
    completionPercentage: number;
    firstReadingDate: Date;
    lastReadingDate: Date;
    currentMilestone: MilestoneData;
    nextMilestone: MilestoneData | null;
    daysActive: number;
    readingRate: number; // Documents read per day on average
  };
};

/**
 * 🌟 ReadingJourneyMap Component
 *
 * Visualizes your reading journey through documentation over time as an interactive timeline.
 * Shows your cumulative progress, significant milestones, and learning pathways.
 *
 * ✨ Features:
 * - Elegant timeline showing cumulative document consumption
 * - Milestone markers for significant achievements
 * - Progress indicators toward journey completion
 * - Category filtering for specialized learning paths
 * - Achievement tracking and next milestone indicators
 */
const ReadingJourneyMap: React.FC<ReadingJourneyMapProps> = ({
  category,
  compact = false,
}) => {
  const { currentTheme } = useTheme();
  const { isMobile } = useMobile();
  const { history } = useReadingHistory();
  const { fileMap } = useDocumentList();

  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Generate journey map data
  useEffect(() => {
    const generateJourneyData = () => {
      setLoading(true);

      // Check if we have reading history data
      if (!history || history.length === 0) {
        setLoading(false);
        return;
      }

      const filteredHistory = category
        ? history.filter((item) => item.path.split("/")[0] === category)
        : history;

      if (filteredHistory.length === 0) {
        setJourneyData(null);
        setLoading(false);
        return;
      }

      // Sort history by timestamp
      const sortedHistory = [...filteredHistory].sort(
        (a, b) => a.lastReadAt - b.lastReadAt
      );

      // Create cumulative data points
      const timelineData: TimelineDataPoint[] = [];

      // Add a starting point at zero
      const firstReadingDate = new Date(sortedHistory[0].lastReadAt);
      firstReadingDate.setDate(firstReadingDate.getDate() - 7); // Start 1 week before

      timelineData.push({
        date: firstReadingDate.getTime(),
        formattedDate: format(firstReadingDate, "MMM d, yyyy"),
        cumulativeCount: 0,
      });

      // Create a Set to track unique document paths
      const uniqueDocuments = new Set<string>();

      // Create cumulative reading count
      sortedHistory.forEach((item) => {
        // Skip if this document was already counted
        if (uniqueDocuments.has(item.path)) return;

        // Add to unique set
        uniqueDocuments.add(item.path);

        // Get document title
        const doc = fileMap[item.path];
        const title = doc?.title || item.title || "Untitled Document";

        // Add data point
        timelineData.push({
          date: item.lastReadAt,
          formattedDate: format(new Date(item.lastReadAt), "MMM d, yyyy"),
          cumulativeCount: uniqueDocuments.size,
          document: {
            title,
            path: item.path,
          },
          isMilestone: false,
        });
      });

      // Define milestones based on reading count
      const milestones: MilestoneData[] = [
        {
          count: 1,
          label: "First Document",
          description: "Your journey begins!",
        },
        {
          count: 5,
          label: "Getting Started",
          description: "You've read your first 5 documents",
        },
        {
          count: 10,
          label: "Double Digits",
          description: "A solid foundation of knowledge",
        },
        {
          count: 25,
          label: "Quarter Century",
          description: "You're becoming an expert",
        },
        {
          count: 50,
          label: "Half Century",
          description: "An impressive collection of knowledge",
        },
        {
          count: 100,
          label: "Century Achievement",
          description: "A true knowledge master",
        },
      ];

      // Add milestone markers
      milestones.forEach((milestone) => {
        const firstPointPassingMilestone = timelineData.find(
          (d) => d.cumulativeCount >= milestone.count
        );

        if (firstPointPassingMilestone) {
          firstPointPassingMilestone.isMilestone = true;
          firstPointPassingMilestone.milestoneLabel = milestone.label;
          firstPointPassingMilestone.milestoneDescription =
            milestone.description;
        }
      });

      // Define recommended pathways if there are sufficient documents
      let recommendedPathway: MilestoneData[] = [];

      // Get total documents in this category
      const totalDocuments = category
        ? Object.keys(fileMap).filter((doc) => doc.split("/")[0] === category)
            .length
        : Object.keys(fileMap).length;

      // Create a recommended pathway based on total documents
      if (totalDocuments > 0) {
        const quarter = Math.round(totalDocuments * 0.25);
        const half = Math.round(totalDocuments * 0.5);
        const threeQuarters = Math.round(totalDocuments * 0.75);

        recommendedPathway = [
          {
            count: quarter,
            label: "25% Complete",
            description: "A quarter of the way there",
          },
          {
            count: half,
            label: "50% Complete",
            description: "Halfway milestone",
          },
          {
            count: threeQuarters,
            label: "75% Complete",
            description: "Almost there",
          },
          {
            count: totalDocuments,
            label: "100% Complete",
            description: "Complete journey",
          },
        ];
      }

      // Calculate overall stats
      const totalRead =
        timelineData[timelineData.length - 1]?.cumulativeCount || 0;
      const completionPercentage =
        totalDocuments > 0 ? Math.round((totalRead / totalDocuments) * 100) : 0;

      // Get current milestone
      let currentMilestone = milestones[0];
      for (let i = milestones.length - 1; i >= 0; i--) {
        if (totalRead >= milestones[i].count) {
          currentMilestone = milestones[i];
          break;
        }
      }

      // Get next milestone
      let nextMilestone = null;
      for (let i = 0; i < milestones.length; i++) {
        if (totalRead < milestones[i].count) {
          nextMilestone = milestones[i];
          break;
        }
      }

      // Calculate average reading rate
      const daysDiff =
        (timelineData[timelineData.length - 1].date - timelineData[0].date) /
        (24 * 60 * 60 * 1000);
      const readingRate = daysDiff > 0 ? +(totalRead / daysDiff).toFixed(2) : 0;

      const result: JourneyData = {
        timeline: timelineData,
        milestones,
        recommendedPathway,
        stats: {
          totalRead,
          totalDocuments,
          completionPercentage,
          firstReadingDate: new Date(sortedHistory[0].lastReadAt),
          lastReadingDate: new Date(
            sortedHistory[sortedHistory.length - 1].lastReadAt
          ),
          currentMilestone,
          nextMilestone,
          daysActive: Math.round(
            (Date.now() - sortedHistory[0].lastReadAt) / (24 * 60 * 60 * 1000)
          ),
          readingRate,
        },
      };

      setJourneyData(result);
      setLoading(false);
    };

    generateJourneyData();
  }, [history, fileMap, category]);

  // Prepare card insights for display
  const insights = useMemo(() => {
    if (!journeyData) return [];

    return [
      {
        label: "Documents",
        value: `${journeyData.stats.totalRead}/${journeyData.stats.totalDocuments}`,
        highlight: true,
      },
      {
        label: "Current milestone",
        value: journeyData.stats.currentMilestone?.label || "Just Started",
      },
      {
        label: "Days active",
        value: journeyData.stats.daysActive.toString(),
      },
      {
        label: "Reading rate",
        value: `${journeyData.stats.readingRate}/day`,
      },
    ];
  }, [journeyData]);

  // Custom tooltip using useChartTooltip hook
  const renderTooltip = useChartTooltip({
    icon: Calendar,
    getTitle: (data) => (
      <div className="flex items-center">
        <span>{data.formattedDate}</span>
        {data.isMilestone && (
          <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-green-500/20 text-green-500">
            Milestone
          </span>
        )}
      </div>
    ),
    getSections: (data) => [
      {
        label: "Documents read:",
        value: data.cumulativeCount,
        highlight: true,
      },
      ...(data.document
        ? [
            {
              label: "Latest document:",
              value: (
                <span className="line-clamp-1 max-w-[150px] text-right">
                  {data.document.title}
                </span>
              ),
            },
          ]
        : []),
    ],
    getFooter: (data) =>
      data.isMilestone
        ? {
            message: data.milestoneLabel || "Milestone reached",
            icon: Trophy,
            className: "text-green-400",
          }
        : undefined,
    className: "bg-popover/95 backdrop-blur-sm",
  });

  // Loading state
  if (loading && history.length > 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-sm"
        >
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 animate-pulse" />
            <span>Mapping your journey...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (!journeyData || journeyData.timeline.length <= 1) {
    return (
      <CardContainer
        title="Reading Journey"
        icon={Map}
        description="Track your progression through documentation"
        variant="subtle"
        baseColor="blue"
      >
        <motion.div
          className="h-full flex items-center justify-center flex-col py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Map className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
          <p className="text-sm text-muted-foreground">
            No journey data available yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Start reading to map your learning journey
          </p>
        </motion.div>
      </CardContainer>
    );
  }

  return (
    <CardContainer
      title="Reading Journey"
      icon={Map}
      description="Track your progression through documentation"
      variant="subtle"
      baseColor="blue"
      insights={insights}
      compact={compact}
      footer={
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div>
            Started {format(journeyData.stats.firstReadingDate, "MMM d, yyyy")}
          </div>
          <div>{journeyData.stats.completionPercentage}% complete</div>
        </div>
      }
    >
      <div className="h-full flex flex-col">
        {/* Header with next milestone */}
        {journeyData.stats.nextMilestone && (
          <div className="px-2 py-1.5 mb-2 bg-secondary/10 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Milestone className="h-3 w-3 text-primary" />
                <span>Next milestone:</span>
                <span className="font-medium">
                  {journeyData.stats.nextMilestone.label}
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 bg-primary/5"
              >
                {journeyData.stats.nextMilestone.count -
                  journeyData.stats.totalRead}{" "}
                more
              </Badge>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="flex-1 min-h-[300px]">
          <ChartContainer
            left={{
              icon: Activity,
              label: "Progress: ",
              value: `${journeyData.stats.completionPercentage}%`,
              className: "text-primary",
            }}
            right={{
              icon: Trophy,
              value: `${
                journeyData.timeline.filter((t) => t.isMilestone).length
              } milestone${
                journeyData.timeline.filter((t) => t.isMilestone).length !== 1
                  ? "s"
                  : ""
              }`,
            }}
          >
            <ChartContainerUI config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={journeyData.timeline}
                  margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                  onMouseMove={(data) => {
                    if (data && data.activeTooltipIndex !== undefined) {
                      setHoveredPoint(data.activeTooltipIndex);
                    }
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={currentTheme.border}
                    opacity={0.15}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="formattedDate"
                    type="category"
                    tick={{
                      fill: currentTheme.foreground + "80",
                      fontSize: isMobile ? 8 : 10,
                    }}
                    axisLine={{ stroke: currentTheme.border, opacity: 0.2 }}
                    tickLine={false}
                    interval={
                      isMobile
                        ? Math.ceil(journeyData.timeline.length / 3)
                        : "preserveEnd"
                    }
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 50 : 30}
                    dy={isMobile ? 10 : 5}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: currentTheme.foreground + "80",
                      fontSize: 10,
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={25}
                    domain={[0, "dataMax + 5"]} // Add some space at top
                  />

                  <ChartTooltip content={renderTooltip} />

                  {/* Add recommended pathway reference lines */}
                  {journeyData.recommendedPathway.map((pathway, index) => (
                    <ReferenceLine
                      key={`pathway-${index}`}
                      y={pathway.count}
                      stroke="#22c55e"
                      strokeDasharray="3 3"
                      strokeOpacity={0.3}
                      label={
                        !isMobile
                          ? {
                              value: pathway.label,
                              position: "right",
                              fill: currentTheme.foreground + "80",
                              fontSize: 9,
                            }
                          : undefined
                      }
                    />
                  ))}

                  <Line
                    type="monotone"
                    dataKey="cumulativeCount"
                    stroke={currentTheme.primary}
                    strokeWidth={2}
                    animationDuration={1000}
                    dot={(props) => {
                      const index = props.index as number;
                      const dataPoint = journeyData.timeline[index];
                      const isHovered = hoveredPoint === index;

                      // For milestones, return invisible dot instead of null
                      if (dataPoint.isMilestone) {
                        return <circle {...props} r={0} />;
                      }

                      return (
                        <circle
                          {...props}
                          r={isHovered ? 5 : 3}
                          fill={
                            isHovered
                              ? currentTheme.primary
                              : currentTheme.background
                          }
                          stroke={currentTheme.primary}
                          strokeWidth={isHovered ? 2 : 1.5}
                          className="transition-all duration-300"
                        />
                      );
                    }}
                    activeDot={{
                      r: 6,
                      stroke: currentTheme.background,
                      strokeWidth: 2,
                      fill: currentTheme.primary,
                    }}
                  />

                  {/* Add milestone markers */}
                  {journeyData.timeline
                    .filter((point) => point.isMilestone)
                    .map((milestone, index) => (
                      <ReferenceDot
                        key={`milestone-${index}`}
                        x={milestone.formattedDate}
                        y={milestone.cumulativeCount}
                        r={
                          hoveredPoint ===
                          journeyData.timeline.findIndex(
                            (t) => t.date === milestone.date
                          )
                            ? 8
                            : 6
                        }
                        fill="#22c55e"
                        stroke={currentTheme.background}
                        strokeWidth={2}
                        className="transition-all duration-300"
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainerUI>
          </ChartContainer>
        </div>

        {/* Milestone list */}
        <div className="mt-2 border-t border-border/30 pt-2">
          <p className="text-xs font-medium mb-1.5 flex items-center">
            <Trophy className="h-3 w-3 text-primary mr-1.5" />
            Journey Milestones:
          </p>

          <ScrollArea className={cn("max-h-20", compact && "max-h-16")}>
            <div className="space-y-1.5">
              {journeyData.timeline
                .filter((point) => point.isMilestone)
                .map((milestone, index) => (
                  <div
                    key={`milestone-list-${index}`}
                    className="flex justify-between items-center text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>{milestone.milestoneLabel}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {milestone.formattedDate}
                    </span>
                  </div>
                ))}

              {journeyData.stats.nextMilestone && (
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full border border-primary"></div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      {journeyData.stats.nextMilestone.label}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {journeyData.stats.nextMilestone.count -
                      journeyData.stats.totalRead}{" "}
                    to go
                  </span>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </CardContainer>
  );
};

export default ReadingJourneyMap;
