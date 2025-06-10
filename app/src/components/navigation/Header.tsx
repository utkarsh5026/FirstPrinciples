import { X, HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  handleHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, handleHomeClick }) => {
  return (
    <div className="bg-background/80 backdrop-blur-xl border-b border-border/20 flex-shrink-0 z-20 sticky top-0">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Home Button - Modern pill design */}
        <motion.button
          className={cn(
            "flex items-center gap-3 rounded-full text-sm font-medium",
            "bg-card/80 backdrop-blur-xl",
            "px-4 py-2.5 text-foreground",
            "hover:bg-card",
            "transition-all duration-300 ease-out",
            "border border-border/50",
            "shadow-sm hover:shadow-md",
            "cursor-pointer"
          )}
          onClick={handleHomeClick}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <HomeIcon size={12} className="text-primary-foreground" />
          </div>
          <span className="font-medium">Home</span>
        </motion.button>

        {/* Close Button - Minimal design */}
        <motion.button
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-muted/50 backdrop-blur-sm",
            "hover:bg-muted/80",
            "text-muted-foreground hover:text-foreground",
            "transition-all duration-200 ease-out",
            "border border-border/30"
          )}
          onClick={() => setSidebarOpen(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Close sidebar"
        >
          <X size={16} strokeWidth={2} />
        </motion.button>
      </div>
    </div>
  );
};

export default Header;
