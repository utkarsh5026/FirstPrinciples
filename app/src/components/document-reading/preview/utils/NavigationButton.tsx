import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import getTopicIcon from "@/components/shared/icons/topicIcon";
import { fromSnakeToTitleCase } from "@/utils/string";

interface NavigationButtonProps {
  direction: "previous" | "next";
  onClick: () => void;
  document?: { title: string; path: string } | null;
  canNavigate: boolean;
  isMobile: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  onClick,
  document,
  canNavigate,
  isMobile,
}) => {
  if (!canNavigate || isMobile) return null;

  const isPrevious = direction === "previous";
  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  const label = isPrevious ? "Previous" : "Next";
  const defaultTitle = isPrevious ? "Previous Document" : "Next Document";

  // Get topic icon based on document path
  const TopicIcon = document?.path
    ? getTopicIcon(document.path.split("/").slice(0, -1).join("/"), 16)
    : null;

  const getDocumentCategory = (path: string) => {
    const parts = path.split("/");
    return parts[0] || "General";
  };

  const documentCategory = document?.path
    ? getDocumentCategory(document.path)
    : "";

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.button
        onClick={onClick}
        className={cn(
          "z-20 group cursor-pointer relative overflow-hidden",
          // Enhanced glassmorphism styling
          "backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent",
          "dark:from-white/10 dark:via-white/5 dark:to-transparent",
          "border border-white/20 dark:border-white/10",
          "shadow-2xl shadow-black/10 dark:shadow-black/25",
          // Mobile: circular button
          "w-12 h-12 rounded-2xl md:rounded-3xl",
          // Desktop: expanded button with text
          "md:w-auto md:h-auto md:px-5 md:py-4 md:min-w-[220px]",
          isPrevious ? "md:-translate-x-6" : "md:translate-x-6",
          "transition-all duration-500 ease-out",
          "hover:shadow-3xl hover:shadow-primary/20",
          "hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:via-primary/2 hover:to-transparent",
          "flex items-center justify-center gap-3",
          isPrevious ? "md:justify-start" : "md:justify-end",
          "hover:scale-105 active:scale-95 md:hover:scale-102",
          "before:absolute before:inset-0 before:rounded-3xl before:p-[1px]",
          "before:bg-gradient-to-br before:from-primary/20 before:via-transparent before:to-primary/10",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
        )}
        initial={{ opacity: 0, x: isPrevious ? -30 : 30, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ y: -2 }}
      >
        {/* Glassmorphism background overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
          initial={false}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          {isPrevious && (
            <Icon className="h-5 w-5 text-primary/80 group-hover:text-primary flex-shrink-0 transition-colors duration-300" />
          )}

          <div
            className={cn(
              "hidden md:block min-w-0 flex-1",
              isPrevious ? "text-left" : "text-right"
            )}
          >
            {/* Category context */}
            {documentCategory && (
              <div className="flex items-center gap-1.5 mb-1">
                {TopicIcon && (
                  <div className="flex-shrink-0 opacity-70 group-hover:opacity-90 transition-opacity">
                    {TopicIcon}
                  </div>
                )}
                <span className="text-xs text-muted-foreground/80 group-hover:text-muted-foreground transition-colors duration-300">
                  {fromSnakeToTitleCase(documentCategory)}
                </span>
              </div>
            )}

            {/* Navigation label */}
            <p className="text-xs text-primary/70 group-hover:text-primary font-medium mb-0.5 transition-colors duration-300">
              {label}
            </p>

            {/* Document title */}
            <p className="text-sm font-semibold text-foreground/90 group-hover:text-foreground truncate max-w-[180px] transition-colors duration-300">
              {document?.title ?? defaultTitle}
            </p>
          </div>

          {!isPrevious && (
            <Icon className="h-5 w-5 text-primary/80 group-hover:text-primary flex-shrink-0 transition-colors duration-300" />
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default NavigationButton;
