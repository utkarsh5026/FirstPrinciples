import { BookOpen, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Legend from "./Legend";

interface HeaderProps {
  showDescriptions: boolean;
  setShowDescriptions: (show: boolean) => void;
  showLegend: boolean;
  setShowLegend: (show: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({
  showDescriptions,
  setShowDescriptions,
  showLegend,
  setShowLegend,
  setSidebarOpen,
}: HeaderProps) => {
  return (
    <div className="bg-card border-b border-border flex-shrink-0 font-cascadia-code z-10">
      <div className="px-3 py-3 flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center text-foreground">
          <BookOpen size={16} className="mr-2 text-primary" />
          Documents
        </h3>

        <div className="flex items-center gap-2">
          {/* Description toggle switch */}
          <div className="flex items-center mr-2">
            <span className="text-xs mr-2 text-muted-foreground">
              Show Details
            </span>
            <Switch
              checked={showDescriptions}
              onCheckedChange={setShowDescriptions}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Legend button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground"
            onClick={() => setShowLegend(!showLegend)}
            title="Legend"
          >
            <Info size={16} />
          </Button>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {/* Legend section */}
      {showLegend && <Legend />}
    </div>
  );
};

export default Header;
