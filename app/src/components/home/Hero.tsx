import { Sparkles, FileText, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { useEffect, useState } from "react";
import useGlobalMetrics from "@/hooks/section/useGlobalMetrics";
import useTodoList from "@/hooks/reading/useTodoList";

/**
 * 🌟 Hero Component
 *
 * A beautiful dashboard hero section that welcomes the user with a personalized
 * greeting based on time of day and displays their learning progress.
 *
 * Features a gradient background, completion stats, and activity badges to
 * encourage continued learning and engagement. ✨
 */
const Hero: React.FC = () => {
  const [greeting, setGreeting] = useState("Hello");
  const [time, setTime] = useState("");

  const { documents, streak } = useGlobalMetrics();
  const { pending, completed } = useTodoList();

  /**
   * 🕰️ Time-based Greeting Generator
   *
   * Creates a friendly personalized greeting based on the time of day
   * with a cute heart emoji to make the user feel special and loved.
   * Updates in real-time with the current time in 12-hour format.
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

  const badges = [
    { icon: <FileText />, label: "Documents read", value: documents.read },
    { icon: <CheckCircle2 />, label: "Completed", value: completed.length },
    { icon: <Clock />, label: "To read", value: pending.length },
    { icon: <Sparkles />, label: "Day streak", value: streak.currentStreak },
  ];

  return (
    <div className="relative overflow-hidden rounded-4xl md:rounded-8xl mb-6 md:mb-8">
      <GradientBackground />

      <div className="relative z-10 px-5 py-6 md:px-8 md:py-10">
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
              className="px-3 py-1.5 flex items-center backdrop-blur-sm rounded-2xl border border-primary/10 bg-primary/10 text-primary"
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

interface GreetingProps {
  greeting: string;
  time: string;
}

/**
 * 👋 Greeting Component
 *
 * Displays a warm welcome message with the current time and a sparkly icon.
 * Creates a personal connection with the user through friendly text and
 * an inviting dashboard title that encourages learning.
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
 *
 * Shows a beautiful circular progress indicator that visualizes how much
 * of the available content the user has completed. The progress circle
 * fills up as the user reads more documents, providing satisfying visual feedback.
 */
const CompletionPercentage: React.FC<CompletionPercentageProps> = ({
  readDocuments,
  availableDocuments,
}) => {
  const { currentTheme } = useTheme();
  const completionPercentage =
    Math.round((readDocuments / availableDocuments) * 100) || 0;

  return (
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
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium">
            {readDocuments} of {availableDocuments}
          </div>
          <div className="text-xs text-muted-foreground">Documents read</div>
        </div>
      </div>
    </div>
  );
};

/**
 * ✨ Gradient Background Component
 *
 * Creates a magical, animated gradient background with subtle patterns
 * and glowing orbs that bring the dashboard to life. The colors adapt
 * to the user's selected theme for a cohesive and delightful experience.
 */
const GradientBackground: React.FC = () => {
  const { currentTheme } = useTheme();
  return (
    <>
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
    </>
  );
};

export default Hero;
