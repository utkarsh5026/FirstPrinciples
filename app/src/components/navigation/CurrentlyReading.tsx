import React from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import CategoryFile from "./CategoryFile";
import type { CurrentCategory } from "./hooks/use-navigate";
import getIconForTech from "@/components/shared/icons/iconMap";
import { motion } from "framer-motion";

interface CurrentlyReadingProps {
  currentCategory: CurrentCategory;
  currentFilePath: string;
  onSelectFile: (filePath: string) => void;
  showDescriptions: boolean;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

const CurrentlyReading: React.FC<CurrentlyReadingProps> = ({
  currentCategory,
  currentFilePath,
  onSelectFile,
  showDescriptions,
  expanded,
  setExpanded,
}) => {
  const { root, name, files } = currentCategory;
  if (!name || files.length === 0) {
    return null;
  }

  const CategoryIcon = getIconForTech(root);

  // Animation variants for smooth transitions
  const variants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    },
    collapsed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="mb-6 mt-3 px-2">
      <Collapsible
        open={expanded}
        onOpenChange={setExpanded}
        className="rounded-2xl overflow-hidden bg-gradient-to-b from-card/80 to-card/50 shadow-lg border border-border/30 backdrop-blur-sm"
      >
        <CollapsibleTrigger className="w-full">
          <div
            className={cn(
              "group flex items-center w-full rounded-t-xl text-sm transition-all py-3 px-4",
              "bg-primary/10 text-primary font-medium backdrop-blur-sm",
              expanded ? "border-b border-border/20" : ""
            )}
          >
            <div
              className={cn(
                "mr-2 flex-shrink-0 transition-transform duration-200",
                expanded ? "rotate-90" : ""
              )}
            >
              <ChevronRight size={16} />
            </div>
            <CategoryIcon size={18} className="mr-2.5 text-primary" />
            <span className="font-medium">{name}</span>
            <motion.span
              className="ml-auto text-xs bg-primary/20 px-2.5 py-0.5 rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {files.length} {files.length === 1 ? "file" : "files"}
            </motion.span>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent asChild>
          <motion.div
            variants={variants}
            initial="collapsed"
            animate={expanded ? "open" : "collapsed"}
            exit="collapsed"
          >
            <div className="p-2 max-h-72 overflow-y-auto scrollbar-hide">
              {files.map((file, index) => {
                const isCurrentFile = file.path === currentFilePath;
                const { isTodo, isCompleted, isRead, depth, path } = file;

                return (
                  <CategoryFile
                    key={path}
                    file={file}
                    depth={depth}
                    isCurrentFile={isCurrentFile}
                    isTodo={isTodo}
                    isCompleted={isCompleted}
                    isRead={isRead}
                    fileNumber={index + 1}
                    handleSelectFile={onSelectFile}
                    showDescriptions={showDescriptions}
                  />
                );
              })}
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CurrentlyReading;
