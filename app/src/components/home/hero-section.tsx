import React, { useEffect, useState } from "react";
import { Sparkles, FileText, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/features/theme/hooks/use-theme";
import useGlobalMetrics from "@/hooks/section/useGlobalMetrics";
import { useReadingList } from "@/hooks";

/**
 * 🌟 Enhanced Hero Component
 *
 * A beautifully redesigned hero section with improved visual design,
 * better readability, and enhanced mobile optimization.
 */
const Hero: React.FC = () => {
  const [greeting, setGreeting] = useState("Hello");
  const [time, setTime] = useState("");

  const { documents, streak } = useGlobalMetrics();
  const { pending, completed } = useReadingList();

  /**
   * 🕰️ Time-based Greeting Generator
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
    // Update time every minute
    const interval = setInterval(createGreetingAccordingToTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const badges = [
    {
      icon: <FileText className="h-3.5 w-3.5" />,
      label: "Documents read",
      value: documents.read,
    },
    {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: "Completed",
      value: completed.length,
    },
    {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "To read",
      value: pending.length,
    },
    {
      icon: <Sparkles className="h-3.5 w-3.5" />,
      label: "Day streak",
      value: streak.currentStreak,
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl md:rounded-4xl mb-6 md:mb-8 shadow-lg border border-primary/10">
      {/* <GradientBackground /> */}

      <div className="relative z-10 px-5 py-6 md:px-8 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <Greeting greeting={greeting} time={time} />

          <CompletionPercentage
            readDocuments={documents.read}
            availableDocuments={documents.available}
          />
        </div>

        {/* Stats badges */}
        <div className="flex flex-wrap gap-2 mt-6">
          {badges.map(({ label, icon, value }) => (
            <Badge
              key={label}
              variant="outline"
              className="px-3 py-1.5 flex items-center gap-2 backdrop-blur-sm rounded-2xl border border-primary/10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-default"
            >
              {icon}
              <span className="font-medium">{value}</span> {label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

interface GreetingProps {
  greeting: string;
  time: string;
}

/**
 * 👋 Greeting Component
 */
const Greeting: React.FC<GreetingProps> = ({ greeting, time }) => {
  return (
    <div className="mb-5 md:mb-0">
      <div className="flex items-center">
        <div className="mr-3 h-10 w-10 rounded-full bg-primary/10 backdrop-blur-md flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-foreground">{greeting}</h2>
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
  );
};

interface CompletionPercentageProps {
  readDocuments: number;
  availableDocuments: number;
}

/**
 * 📊 Completion Percentage Component
 */
const CompletionPercentage: React.FC<CompletionPercentageProps> = ({
  readDocuments,
  availableDocuments,
}) => {
  const { currentTheme } = useTheme();
  const completionPercentage =
    Math.round((readDocuments / availableDocuments) * 100) || 0;

  // Create segments for the circle
  const segments = [];
  const segmentCount = 36; // For a smooth circle
  for (let i = 0; i < segmentCount; i++) {
    const segmentPercentage = (i / segmentCount) * 100;
    segments.push({
      filled: segmentPercentage < completionPercentage,
      rotation: (i / segmentCount) * 360,
    });
  }

  return (
    <div className="bg-card/30 backdrop-blur-md rounded-2xl border border-primary/10 p-4 w-full md:w-auto md:min-w-56 transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex items-center">
        <div className="relative w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center">
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>

          {/* Progress circle with gradient */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
            <defs>
              <linearGradient
                id="progressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={`${currentTheme.primary}`}
                  stopOpacity="0.8"
                />
                <stop
                  offset="100%"
                  stopColor={`${currentTheme.primary}`}
                  stopOpacity="0.4"
                />
              </linearGradient>
            </defs>
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="3"
              strokeDasharray={`${completionPercentage * 0.9425} 100`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>

          {/* Percentage text */}
          <span className="text-sm font-medium z-10">
            {completionPercentage}%
          </span>
        </div>

        <div className="ml-4">
          <div className="text-sm font-medium">
            {readDocuments} of {availableDocuments}
          </div>
          <div className="text-xs text-muted-foreground">Documents read</div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
