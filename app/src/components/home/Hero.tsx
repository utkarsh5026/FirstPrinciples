import { Sparkles, FileText, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme/context/ThemeContext";
import type {
  ReadingHistoryItem,
  ReadingTodoItem,
} from "@/hooks/useDocumentManager";
import type { FileMetadata } from "@/utils/MarkdownLoader";
import { useEffect, useState } from "react";

interface EnhancedHeroProps {
  availableDocuments: FileMetadata[];
  todoList: ReadingTodoItem[];
  readingHistory: ReadingHistoryItem[];
}

/**
 * Enhanced Hero component with a more dynamic and visually appealing design.
 * Features gradient animations, better layout for mobile and desktop, and improved stat visualization.
 */
const EnhancedHero: React.FC<EnhancedHeroProps> = ({
  availableDocuments,
  todoList,
  readingHistory,
}) => {
  const { currentTheme } = useTheme();
  const [greeting, setGreeting] = useState("Hello");
  const [time, setTime] = useState("");

  // Update greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "";

    if (hour < 12) newGreeting = "Good morning";
    else if (hour < 17) newGreeting = "Good afternoon";
    else newGreeting = "Good evening";

    setGreeting(newGreeting);

    // Format current time
    const timeString = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    setTime(timeString);
  }, []);

  // Calculate completion percentage
  const completedDocs = readingHistory.length;
  const totalDocs = availableDocuments.length;
  const completionPercentage =
    Math.round((completedDocs / totalDocs) * 100) || 0;

  // Get stats for the badges
  const pendingReads = todoList.filter((item) => !item.completed).length;
  const completedItems = todoList.filter((item) => item.completed).length;

  // Simulate streak count (we'd typically get this from analytics)
  const streakCount =
    readingHistory.length > 0 ? readingHistory.length % 14 || 1 : 0;

  // Custom badge styles with alpha transparency to work better on the gradient
  const badgeStyle = {
    backgroundColor: `${currentTheme.primary}20`, // Using hex with alpha
    color: currentTheme.primary,
    border: `1px solid ${currentTheme.primary}40`,
  };

  return (
    <div className="relative overflow-hidden rounded-xl md:rounded-8xl mb-6 md:mb-8">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-90 animate-gradient-slow"
        style={{
          backgroundImage: `linear-gradient(120deg, ${currentTheme.primary}20, ${currentTheme.background}, ${currentTheme.primary}20)`,
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary opacity-5 blur-2xl"></div>

      {/* Mesh grid pattern overlay (subtle) */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(${currentTheme.primary}60 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 px-5 py-6 md:px-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Left side - Greeting and main info */}
          <div className="mb-5 md:mb-0">
            <div className="flex items-center">
              <div className="mr-3 h-10 w-10 rounded-full bg-primary/10 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  {greeting}
                </h2>
                <p className="text-sm text-muted-foreground">{time}</p>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-4 md:mt-5">
              Your Learning Dashboard
            </h1>

            <div className="mt-1 md:mt-2 text-sm text-muted-foreground max-w-lg">
              Continue your learning journey, track progress, and discover new
              content.
            </div>
          </div>

          {/* Right side - Stats preview */}
          <div className="bg-card/30 backdrop-blur-md rounded-lg border border-primary/10 p-3 md:p-4 w-full md:w-auto md:min-w-64">
            <div className="flex items-center">
              <div
                className="w-12 h-12 rounded-full flex-shrink-0 border-4 bg-background flex items-center justify-center relative"
                style={{ borderColor: `${currentTheme.primary}30` }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${currentTheme.primary} ${completionPercentage}%, transparent 0)`,
                    opacity: 0.2,
                  }}
                ></div>
                <span className="text-sm font-medium">
                  {completionPercentage}%
                </span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">
                  {completedDocs} of {totalDocs}
                </div>
                <div className="text-xs text-muted-foreground">
                  Documents read
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}

        {/* Stats badges */}
        <div className="flex flex-wrap gap-2 mt-6">
          <Badge
            className="px-3 py-1.5 flex items-center backdrop-blur-sm"
            style={badgeStyle}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {totalDocs} Documents
          </Badge>

          <Badge
            className="px-3 py-1.5 flex items-center backdrop-blur-sm"
            style={badgeStyle}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            {completedItems} Completed
          </Badge>

          <Badge
            className="px-3 py-1.5 flex items-center backdrop-blur-sm"
            style={badgeStyle}
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            {pendingReads} To Read
          </Badge>

          {streakCount > 0 && (
            <Badge
              className="px-3 py-1.5 flex items-center backdrop-blur-sm"
              style={badgeStyle}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {streakCount} Day Streak
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedHero;
