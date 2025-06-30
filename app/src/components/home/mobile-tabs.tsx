import React from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Clock, ListTodo, BarChart } from "lucide-react";
import { useTabContext, TabType } from "./context/tab-context";
import { Button } from "@/components/ui/button";

interface MobileOptimizedTabsProps {
  className?: string;
}

const tabs: { id: TabType; icon: React.ElementType }[] = [
  {
    id: "overview",
    icon: LayoutDashboard,
  },
  {
    id: "history",
    icon: Clock,
  },
  {
    id: "todo",
    icon: ListTodo,
  },
  {
    id: "analytics",
    icon: BarChart,
  },
];

/**
 * MobileOptimizedTabs Component
 *
 * A minimalist mobile navigation bar with icon-only tabs at the bottom of the screen.
 */
const MobileOptimizedTabs: React.FC<MobileOptimizedTabsProps> = ({
  className,
}) => {
  const { activeTab, setActiveTab } = useTabContext();

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 flex items-center justify-around bg-background/80 backdrop-blur-sm border-t border-border/50 py-3 md:hidden z-50",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <Button
            variant="ghost"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "p-3 transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground/60 hover:text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}
    </div>
  );
};

export default MobileOptimizedTabs;
