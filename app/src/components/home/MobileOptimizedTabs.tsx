import React from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Clock, ListTodo, BarChart } from "lucide-react";
import { useTabContext, TabType } from "./context/TabContext";
interface MobileOptimizedTabsProps {
  className?: string;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "history",
    label: "History",
    icon: Clock,
  },
  {
    id: "todo",
    label: "Reading",
    icon: ListTodo,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart,
  },
];

/**
 * MobileOptimizedTabs Component
 *
 * A mobile-friendly navigation bar that appears at the bottom of the screen on small devices.
 * This component creates a tab bar with icons and short labels optimized for mobile screens,
 * now including the Analytics tab.
 *
 * Features:
 * - Fixed position at bottom of screen on mobile devices
 * - Simple, touch-friendly tab buttons with icons
 * - Visual indication of the active tab
 * - Hidden on desktop screens (md breakpoint and above)
 */
const MobileOptimizedTabs: React.FC<MobileOptimizedTabsProps> = ({
  className,
}) => {
  const { activeTab, setActiveTab } = useTabContext();

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 flex items-center justify-around bg-card border-t border-border p-1 md:hidden z-50",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors",
              "w-full mx-0.5 text-xs",
              isActive
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 mb-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className="truncate w-full text-center">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileOptimizedTabs;
