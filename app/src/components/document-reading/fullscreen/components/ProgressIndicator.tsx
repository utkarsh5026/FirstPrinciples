import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileProgressIndicatorProps {
  currentIndex: number;
  total: number;
  onSelectSection: (index: number) => void;
}

export const MobileProgressIndicator: React.FC<MobileProgressIndicatorProps> = ({
  currentIndex,
  total,
  onSelectSection,
}) => {
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="relative">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        {/* Section indicators */}
        <div className="flex justify-between absolute -bottom-3 left-0 right-0">
          {Array.from({ length: Math.min(total, 10) }).map((_, index) => {
            const actualIndex = Math.floor((index / 9) * (total - 1));
            const isActive = actualIndex <= currentIndex;

            return (
              <button
                title={`Go to section ${actualIndex + 1}`}
                key={index}
                onClick={() => onSelectSection(actualIndex)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300 hover:scale-125",
                  isActive
                    ? "bg-primary shadow-lg shadow-primary/50"
                    : "bg-white/20 hover:bg-white/40"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Progress text */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-white/60 font-medium">
          Section {currentIndex + 1} of {total}
        </span>
        <span className="text-white/60">{Math.round(progress)}% complete</span>
      </div>
    </div>
  );
};
interface DesktopProgressIndicatorProps {
  currentIndex: number;
  total: number;
  onSelectSection: (index: number) => void;
}

export const DesktopProgressIndicator: React.FC<DesktopProgressIndicatorProps> = ({
  currentIndex,
  total,
  onSelectSection,
}) => (
  <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40">
    <div className="flex flex-col gap-3">
      {Array.from({ length: Math.min(total, 15) }).map((_, index) => {
        const actualIndex =
          total <= 15 ? index : Math.floor((index / 14) * (total - 1));
        const isActive = actualIndex === currentIndex;
        const isCompleted = actualIndex < currentIndex;

        return (
          <motion.button
            key={index}
            onClick={() => onSelectSection(actualIndex)}
            className={cn(
              "w-4 h-4 rounded-full transition-all duration-300 border-2",
              isActive
                ? "bg-primary border-primary shadow-lg shadow-primary/50 scale-125"
                : isCompleted
                ? "bg-primary/60 border-primary/60 hover:bg-primary hover:border-primary"
                : "bg-transparent border-white/30 hover:border-white/60 hover:bg-white/10"
            )}
            whileHover={{ scale: isActive ? 1.25 : 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        );
      })}
    </div>
  </div>
);


