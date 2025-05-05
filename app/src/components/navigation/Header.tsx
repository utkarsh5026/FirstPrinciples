import { X, Info, Eye, EyeOff, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Legend from "./Legend";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  showDescriptions: boolean;
  setShowDescriptions: (show: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  handleHomeClick: () => void;
}

const Header = ({
  showDescriptions,
  setShowDescriptions,
  setSidebarOpen,
  handleHomeClick,
}: HeaderProps) => {
  const [showLegend, setShowLegend] = useState(false);
  return (
    <div className="bg-card border-b border-border flex-shrink-0 font-cascadia-code z-10">
      <div className="px-3 py-3 flex items-center justify-between">
        <button
          className={cn(
            "flex items-center rounded-md text-sm cursor-pointer",
            "font-medium"
          )}
          onClick={handleHomeClick}
        >
          <div className="flex-shrink-0 mr-2 text-primary">
            <HomeIcon size={16} />
          </div>
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Description toggle with icon */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground hidden xs:inline">
              {showDescriptions ? "Hide" : "Show"} Details
            </span>
            <Switch
              checked={showDescriptions}
              onCheckedChange={setShowDescriptions}
              className="data-[state=checked]:bg-primary"
            />
            {showDescriptions ? (
              <Eye size={14} className="text-primary xs:hidden" />
            ) : (
              <EyeOff size={14} className="text-muted-foreground xs:hidden" />
            )}
          </div>

          {/* Legend button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            onClick={() => setShowLegend(!showLegend)}
            aria-label={showLegend ? "Hide legend" : "Show legend"}
          >
            <Info size={16} />
          </Button>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-secondary/20"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Legend section */}
      {showLegend && <Legend />}
    </div>
  );
};

export default Header;
