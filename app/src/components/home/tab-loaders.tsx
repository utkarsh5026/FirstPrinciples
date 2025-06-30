import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/features/theme/hooks/use-theme";
import React from "react";
import { LayoutDashboard, Clock, ListTodo, BarChart } from "lucide-react";

interface TabLoaderProps {
  heading: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * TabLoader Component
 *
 * A clean, minimal loader component that appears while tab content is loading.
 * Features a simple, elegant design with a title, description, and animated loading indicator.
 *
 * The component is optimized for both mobile and desktop viewing, with responsive spacing
 * and sizing to ensure a pleasant experience across all device types.
 */
const TabLoader: React.FC<TabLoaderProps> = ({
  heading,
  description,
  icon,
}) => {
  const { currentTheme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md p-6 md:p-8 rounded-3xl border border-primary/20 text-center shadow-sm relative overflow-hidden">
        {/* Subtle gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-br opacity-10"
          style={{
            backgroundImage: `linear-gradient(135deg, ${currentTheme.primary}30, transparent)`,
          }}
        ></div>

        {/* Icon container with pulsing effect */}
        <div className="relative z-10 mb-5">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-lg md:text-xl font-medium mb-3">{heading}</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {/* Loading indicator */}
        <div className="relative z-10 flex justify-center gap-2">
          <div className="h-2 w-2 bg-primary/60 rounded-full animate-pulse"></div>
          <div className="h-2 w-2 bg-primary/60 rounded-full animate-pulse delay-150"></div>
          <div className="h-2 w-2 bg-primary/60 rounded-full animate-pulse delay-300"></div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Tab Loader Components
 *
 * These components provide a consistent loading experience across different tabs
 * in the application. Each loader is tailored to the specific tab content with
 * appropriate icons and descriptive text, while maintaining a unified visual design.
 *
 * The loaders are optimized for both mobile and desktop viewing, providing
 * users with an elegant loading experience regardless of device.
 */

/**
 * Overview Tab Loader
 *
 * Displays while the dashboard overview content is loading.
 */
export const OverviewTabLoader = () => (
  <TabLoader
    heading="Loading Your Dashboard"
    description="Preparing your personalized reading insights and statistics..."
    icon={<LayoutDashboard className="h-7 w-7 text-primary/70 animate-pulse" />}
  />
);

/**
 * History Tab Loader
 *
 * Displays while the reading history content is loading.
 */
export const HistoryTabLoader = () => (
  <TabLoader
    heading="Loading Reading History"
    description="Retrieving your past reading activities and organizing them by time..."
    icon={<Clock className="h-7 w-7 text-primary/70 animate-pulse" />}
  />
);

/**
 * To-do List Loader
 *
 * Displays while the reading list content is loading.
 */
export const TodoListLoader = () => (
  <TabLoader
    heading="Loading Reading List"
    description="Organizing your reading queue and planned documents..."
    icon={<ListTodo className="h-7 w-7 text-primary/70 animate-pulse" />}
  />
);

/**
 * Analytics Tab Loader
 *
 * Displays while the analytics content is loading.
 */
export const AnalyticsTabLoader = () => (
  <TabLoader
    heading="Loading Analytics"
    description="Calculating your reading stats and visualizing your progress..."
    icon={<BarChart className="h-7 w-7 text-primary/70 animate-pulse" />}
  />
);
