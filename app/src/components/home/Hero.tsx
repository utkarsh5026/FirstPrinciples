import { Sparkles, FileText, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { useEffect, useMemo, useState } from "react";
import { useDocumentManager } from "@/context";

/**
 * Hero component with a more dynamic and visually appealing design.
 * Features gradient animations, better layout for mobile and desktop, and improved stat visualization.
 */
/**
 * Hero component for the dashboard homepage
 *
 * Displays a visually appealing hero section with user greeting, progress stats,
 * and reading metrics. Features animated gradient backgrounds and responsive design.
 *
 * @param {FileMetadata[]} availableDocuments - List of all available documents in the system
 * @param {ReadingTodoItem[]} todoList - User's reading list with completed/pending status
 * @param {ReadingHistoryItem[]} readingHistory - User's reading history records
 * @returns {JSX.Element} A responsive hero component with user stats and greeting
 */
const Hero: React.FC = () => {
  const { currentTheme } = useTheme();
  const [greeting, setGreeting] = useState("Hello");
  const [time, setTime] = useState("");

  const { availableDocuments, todoList, readingHistory } = useDocumentManager();

  /**
   * Sets appropriate greeting based on time of day and formats current time
   *
   * Updates the greeting message (morning/afternoon/evening) based on current hour
   * and formats the current time in 12-hour format with AM/PM
   */
  useEffect(() => {
    const createGreetingAccordingToTime = () => {
      const hour = new Date().getHours();
      let newGreeting = "";

      if (hour < 12) newGreeting = "Good morning, Sweetheart 💖";
      else if (hour < 17) newGreeting = "Good afternoon, Sweetheart 💖";
      else newGreeting = "Good evening, Sweetheart 💖";

      setGreeting(newGreeting);
      const timeString = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setTime(timeString);
    };

    createGreetingAccordingToTime();
  }, []);

  /**
   * Calculates reading statistics from the to-do list
   *
   * @returns {Object} Object containing counts of pending and completed reading items
   */
  const { pendingReads, completedItems } = useMemo(() => {
    const pendingReads = todoList.filter((item) => !item.completed).length;
    const completedItems = todoList.filter((item) => item.completed).length;

    return {
      pendingReads,
      completedItems,
    };
  }, [todoList]);

  // Calculate overall progress metrics
  const completedDocs = readingHistory.length;
  const totalDocs = availableDocuments.length;
  const completionPercentage =
    Math.round((completedDocs / totalDocs) * 100) || 0;
  const streakCount =
    readingHistory.length > 0 ? readingHistory.length % 14 || 1 : 0;

  // Style for the stat badges using theme colors
  const badgeStyle = {
    backgroundColor: `${currentTheme.primary}20`,
    color: currentTheme.primary,
    border: `1px solid ${currentTheme.primary}40`,
  };

  // Configuration for the stat badges
  const badges = [
    { icon: <FileText />, label: "Documents read", value: completedDocs },
    { icon: <CheckCircle2 />, label: "Completed", value: completedItems },
    { icon: <Clock />, label: "To read", value: pendingReads },
    { icon: <Sparkles />, label: "Day streak", value: streakCount },
  ];

  return (
    <div className="relative overflow-hidden rounded-4xl md:rounded-8xl mb-6 md:mb-8">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-90 animate-gradient-slow"
        style={{
          backgroundImage: `linear-gradient(120deg, ${currentTheme.primary}20, ${currentTheme.background}, ${currentTheme.primary}20)`,
        }}
      />

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
          <div className="bg-card/30 backdrop-blur-md rounded-4xl border border-primary/10 p-3 md:p-4 w-full md:w-auto md:min-w-64 ">
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

        {/* Stats badges */}
        <div className="flex flex-wrap gap-2 mt-6">
          {badges.map(({ label, icon, value }) => (
            <Badge
              key={label}
              className="px-3 py-1.5 flex items-center backdrop-blur-sm rounded-2xl"
              style={badgeStyle}
            >
              {icon}
              {value} {label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
