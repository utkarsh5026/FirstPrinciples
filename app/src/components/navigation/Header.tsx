import { X, HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  handleHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, handleHomeClick }) => {
  return (
    <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20 flex-shrink-0 z-20 sticky top-0">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Home Button - Modern pill design */}
        <motion.button
          className={cn(
            "flex items-center gap-3 rounded-full text-sm font-medium",
            "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-700/50",
            "px-4 py-2.5 text-gray-700 dark:text-gray-200",
            "hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-700/70 dark:hover:to-gray-600/70",
            "transition-all duration-300 ease-out",
            "border border-gray-200/50 dark:border-gray-700/50",
            "shadow-sm hover:shadow-md"
          )}
          onClick={handleHomeClick}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
            <HomeIcon size={12} className="text-white" />
          </div>
          <span className="font-medium">Home</span>
        </motion.button>

        {/* Close Button - Minimal design */}
        <motion.button
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm",
            "hover:bg-gray-200/80 dark:hover:bg-gray-700/80",
            "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            "transition-all duration-200 ease-out",
            "border border-gray-200/30 dark:border-gray-700/30"
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
