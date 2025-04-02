// src/components/core/ViewToggle.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { AlignJustify, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export type ViewMode = "standard" | "cards";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  className?: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  className,
}) => {
  return (
    <div className={cn("flex items-center", className)}>
      <TooltipProvider>
        <div className="bg-secondary/50 rounded-lg p-1 flex space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentView === "standard" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("standard")}
                className={cn(
                  "h-8 px-3 rounded-md flex items-center",
                  currentView === "standard"
                    ? "bg-card shadow-sm"
                    : "bg-transparent"
                )}
                aria-label="Standard View"
              >
                <AlignJustify className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Standard</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Standard document view</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentView === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("cards")}
                className={cn(
                  "h-8 px-3 rounded-md flex items-center",
                  currentView === "cards"
                    ? "bg-card shadow-sm"
                    : "bg-transparent"
                )}
                aria-label="Card View"
              >
                <IdCard className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Section-by-section card view</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ViewToggle;
