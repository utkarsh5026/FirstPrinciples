import { AnimatePresence, motion } from "framer-motion";
import { X, Settings, List } from "lucide-react";

interface HeaderProps {
  onExit: () => void;
  onSettings: () => void;
  onMenu: () => void;
  isVisible: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onExit,
  onSettings,
  onMenu,
  isVisible,
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 z-50"
      >
        <div className="flex items-center justify-between p-6 bg-gradient-to-b from-black/60 via-black/20 to-transparent backdrop-blur-md">
          <motion.button
            onClick={onExit}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/10 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-5 w-5 text-white" />
          </motion.button>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={onSettings}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/10 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="h-5 w-5 text-white" />
            </motion.button>
            <motion.button
              onClick={onMenu}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/10 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="h-5 w-5 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Header;
