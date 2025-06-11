import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationControlsProps {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  isVisible: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentIndex,
  total,
  onPrevious,
  onNext,
  isVisible,
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 z-50 lg:hidden"
      >
        <div className="flex items-center justify-center p-6 bg-gradient-to-t from-black/60 via-black/20 to-transparent backdrop-blur-md">
          <div className="flex items-center gap-8">
            <motion.button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className={cn(
                "p-4 rounded-full transition-all duration-200 border",
                currentIndex === 0
                  ? "bg-white/5 text-white/30 border-white/5"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10 hover:border-white/20"
              )}
              whileHover={currentIndex !== 0 ? { scale: 1.05 } : {}}
              whileTap={currentIndex !== 0 ? { scale: 0.95 } : {}}
            >
              <ChevronLeft className="h-6 w-6" />
            </motion.button>

            <div className="w-px h-10 bg-white/20" />

            <motion.button
              onClick={onNext}
              disabled={currentIndex === total - 1}
              className={cn(
                "p-4 rounded-full transition-all duration-200 border",
                currentIndex === total - 1
                  ? "bg-white/5 text-white/30 border-white/5"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10 hover:border-white/20"
              )}
              whileHover={currentIndex !== total - 1 ? { scale: 1.05 } : {}}
              whileTap={currentIndex !== total - 1 ? { scale: 0.95 } : {}}
            >
              <ChevronRight className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default NavigationControls;
