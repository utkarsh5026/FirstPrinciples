import { X, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  handleHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, handleHomeClick }) => {
  return (
    <div className="bg-card/80 backdrop-blur-lg border-b border-border flex-shrink-0 font-cascadia-code z-10 sticky top-0">
      <div className="px-4 py-2 flex items-center justify-between">
        <motion.button
          className={cn(
            "flex items-center rounded-full text-sm cursor-pointer",
            "font-medium bg-secondary/30 px-3 py-1.5 hover:bg-secondary/50 transition-all"
          )}
          onClick={handleHomeClick}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex-shrink-0 mr-2 text-primary">
            <HomeIcon size={16} />
          </div>
          <span>Home</span>
        </motion.button>

        <div className="flex items-center gap-2">
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
    </div>
  );
};

export default Header;
