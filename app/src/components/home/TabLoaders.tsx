import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/ui/use-theme";

/**
 * A collection of abstract SVG shapes used as loading indicators
 * Each loader uses unique text and visual metaphors to represent the content being loaded
 */

export const OverviewTabLoader = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-8 font-cascadia-code">
      <Card className="p-6 rounded-3xl border border-primary/20 text-center">
        <h3 className="text-lg font-medium mb-4">Preparing Your Dashboard</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Loading your personalized reading insights and recommendations...
        </p>

        <div className="flex justify-center mb-4">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={`${currentTheme.primary}30`}
              strokeWidth="2"
            />
            <circle
              cx="60"
              cy="60"
              r="40"
              fill="none"
              stroke={`${currentTheme.primary}50`}
              strokeWidth="2"
              className="animate-[spin_3s_linear_infinite]"
            />
            <rect
              x="50"
              y="30"
              width="20"
              height="20"
              fill={`${currentTheme.primary}40`}
              className="animate-pulse"
            />
            <path
              d="M30,70 L90,70 L90,90 L30,90 Z"
              fill={`${currentTheme.primary}20`}
              className="animate-pulse"
            />
            <path
              d="M30,30 L40,40 L20,40 Z"
              fill={`${currentTheme.primary}60`}
              className="animate-bounce"
            />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="h-2 bg-primary/10 rounded-full animate-pulse"></div>
          <div className="h-2 bg-primary/20 rounded-full animate-pulse delay-100"></div>
          <div className="h-2 bg-primary/10 rounded-full animate-pulse delay-200"></div>
        </div>
      </Card>

      <div className="text-center my-8">
        <p className="text-sm text-muted-foreground">
          Building your reading stats and progress insights...
        </p>
      </div>
    </div>
  );
};

export const HistoryTabLoader = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-8 font-cascadia-code font-bold h-full flex flex-col justify-center items-center">
      <Card className="p-6 rounded-3xl border border-primary/20 text-center shadow-md shadow-primary/20">
        <h3 className="text-lg font-medium mb-4">Retrieving Reading History</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Collecting your past reading activities and organizing them by time...
        </p>

        <div className="flex justify-center mb-4">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <line
              x1="20"
              y1="60"
              x2="100"
              y2="60"
              stroke={`${currentTheme.primary}40`}
              strokeWidth="4"
              strokeDasharray="5,5"
              className="animate-[dash_15s_linear_infinite]"
            />
            <circle
              cx="40"
              cy="40"
              r="15"
              fill={`${currentTheme.primary}30`}
              className="animate-pulse"
            />
            <circle
              cx="70"
              cy="30"
              r="10"
              fill={`${currentTheme.primary}20`}
              className="animate-pulse delay-300"
            />
            <circle
              cx="90"
              cy="50"
              r="12"
              fill={`${currentTheme.primary}40`}
              className="animate-pulse delay-700"
            />
            <rect
              x="30"
              y="70"
              width="60"
              height="8"
              fill={`${currentTheme.primary}20`}
              rx="4"
              className="animate-pulse"
            />
            <rect
              x="40"
              y="85"
              width="40"
              height="8"
              fill={`${currentTheme.primary}10`}
              rx="4"
              className="animate-pulse delay-500"
            />
          </svg>
        </div>

        <p className="text-xs text-muted-foreground">
          This may take a moment as we analyze your reading patterns
        </p>
      </Card>

      <div className="flex justify-center opacity-70">
        <div className="h-2 w-2 bg-primary rounded-full animate-ping mr-1"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-ping delay-150 mr-1"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-ping delay-300"></div>
      </div>
    </div>
  );
};

export const TodoListLoader = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-8 font-cascadia-code font-bold h-full flex flex-col justify-center items-center">
      <Card className="p-6 rounded-3xl border border-primary/20 text-center shadow-md shadow-primary/20">
        <h3 className="text-lg font-medium mb-4">Preparing Reading List</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Organizing your reading queue and planned documents...
        </p>

        <div className="flex justify-center mb-4">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <rect
              x="20"
              y="20"
              width="80"
              height="80"
              fill="none"
              stroke={`${currentTheme.primary}20`}
              strokeWidth="2"
              rx="8"
            />
            <line
              x1="30"
              y1="40"
              x2="50"
              y2="40"
              stroke={`${currentTheme.primary}60`}
              strokeWidth="4"
              className="animate-pulse"
            />
            <line
              x1="30"
              y1="60"
              x2="70"
              y2="60"
              stroke={`${currentTheme.primary}40`}
              strokeWidth="4"
              className="animate-pulse delay-200"
            />
            <line
              x1="30"
              y1="80"
              x2="60"
              y2="80"
              stroke={`${currentTheme.primary}50`}
              strokeWidth="4"
              className="animate-pulse delay-400"
            />
            <circle
              cx="90"
              cy="30"
              r="6"
              fill={`${currentTheme.primary}30`}
              className="animate-bounce"
            />
            <circle
              cx="90"
              cy="50"
              r="6"
              fill={`${currentTheme.primary}30`}
              className="animate-bounce delay-300"
            />
            <circle
              cx="90"
              cy="70"
              r="6"
              fill={`${currentTheme.primary}30`}
              className="animate-bounce delay-600"
            />
          </svg>
        </div>

        <p className="text-xs text-muted-foreground">
          Getting your priorities in order
        </p>
      </Card>

      <div className="text-center">
        <p className="text-sm italic text-muted-foreground">
          "Reading is a conversation. All books talk. But a good book listens as
          well."
          <br />
          <span className="text-xs mt-1 inline-block">— Mark Haddon</span>
        </p>
      </div>
    </div>
  );
};

export const AnalyticsTabLoader = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-8 font-cascadia-code font-bold h-full flex flex-col justify-center items-center">
      <Card className="p-6 rounded-3xl border border-primary/20 text-center shadow-md shadow-primary/20">
        <h3 className="text-lg font-medium mb-4">
          Calculating Reading Analytics
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Crunching numbers and generating insights from your reading data...
        </p>

        <div className="flex justify-center mb-4">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <path
              d="M10,90 L110,90"
              stroke={`${currentTheme.primary}40`}
              strokeWidth="2"
            />
            <path
              d="M10,20 L10,90"
              stroke={`${currentTheme.primary}40`}
              strokeWidth="2"
            />
            <path
              d="M30,70 L30,90"
              stroke={`${currentTheme.primary}30`}
              strokeWidth="8"
              className="animate-[height_2s_ease-in-out_infinite_alternate]"
            />
            <path
              d="M50,50 L50,90"
              stroke={`${currentTheme.primary}50`}
              strokeWidth="8"
              className="animate-[height_2s_ease-in-out_infinite_alternate_delay-100]"
            />
            <path
              d="M70,60 L70,90"
              stroke={`${currentTheme.primary}40`}
              strokeWidth="8"
              className="animate-[height_2s_ease-in-out_infinite_alternate_delay-200]"
            />
            <path
              d="M90,30 L90,90"
              stroke={`${currentTheme.primary}60`}
              strokeWidth="8"
              className="animate-[height_2s_ease-in-out_infinite_alternate_delay-300]"
            />
            <circle
              cx="90"
              cy="30"
              r="5"
              fill={currentTheme.primary}
              className="animate-pulse"
            />
          </svg>
        </div>

        <div className="text-xs text-muted-foreground flex justify-between">
          <span>Progress</span>
          <span>Categories</span>
          <span>Time</span>
          <span>Achievements</span>
        </div>
      </Card>

      <div className="text-center">
        <p className="text-sm text-muted-foreground italic">
          "The more that you read, the more things you will know. The more that
          you learn, the more places you'll go."
          <br />
          <span className="text-xs mt-1 inline-block">— Dr. Seuss</span>
        </p>
      </div>
    </div>
  );
};
