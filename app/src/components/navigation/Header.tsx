import { X, Info, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Legend from "./Legend";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  handleHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, handleHomeClick }) => {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border flex-shrink-0 font-cascadia-code z-10 sticky top-0">
      <div className="px-4 py-3.5 flex items-center justify-between">
        <motion.button
          className={cn(
            "flex items-center rounded-full text-sm cursor-pointer",
            "font-medium bg-secondary/30 px-3 py-1.5 hover:bg-secondary/50 transition-all"
          )}
          onClick={handleHomeClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex-shrink-0 mr-2 text-primary">
            <HomeIcon size={16} />
          </div>
          <span>Home</span>
        </motion.button>

        <div className="flex items-center gap-2">
          {/* Description toggle with icon */}

          {/* Legend button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/30 flex items-center justify-center"
            onClick={() => setShowLegend(!showLegend)}
            aria-label={showLegend ? "Hide legend" : "Show legend"}
          >
            <Info size={16} />
          </Button>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-secondary/30 flex items-center justify-center"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Legend section with animation */}
      {showLegend && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Legend />
        </motion.div>
      )}
    </div>
  );
};

export default Header;
