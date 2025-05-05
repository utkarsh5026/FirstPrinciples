import { BookOpen, X, Info, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Legend from "./Legend";
import { useState } from "react";

interface HeaderProps {
  showDescriptions: boolean;
  setShowDescriptions: (show: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({
  showDescriptions,
  setShowDescriptions,
  setSidebarOpen,
}: HeaderProps) => {
  const [showLegend, setShowLegend] = useState(false);
  return (
    <div className="bg-card border-b border-border flex-shrink-0 font-cascadia-code z-10">
      <div className="px-3 py-3 flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center text-foreground">
          <BookOpen size={16} className="mr-2 text-primary" />
          <span className="hidden sm:inline">Documents</span>
          <span className="inline sm:hidden">Docs</span>
        </h3>

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
