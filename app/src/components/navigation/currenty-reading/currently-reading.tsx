import React from "react";
import { cn } from "@/lib/utils";
import CategoryFile from "../documents/CategoryFile";
import type { CurrentCategory } from "../hooks/use-navigate";
import getIconForTech from "@/components/shared/icons/icon-map";
import { motion } from "framer-motion";

interface CurrentlyReadingProps {
  currentCategory: CurrentCategory;
  currentFilePath: string;
  onSelectFile: (filePath: string) => void;
}

const CurrentlyReading: React.FC<CurrentlyReadingProps> = ({
  currentCategory,
  currentFilePath,
  onSelectFile,
}) => {
  const { root, name, files } = currentCategory;
  if (!name || files.length === 0) {
    return null;
  }

  const CategoryIcon = getIconForTech(root);

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-card/80 to-card/50 shadow-lg border border-border/30 backdrop-blur-sm">
      <div
        className={cn(
          "group flex items-center w-full rounded-t-xl text-sm transition-all py-3 px-4",
          "bg-primary/10 text-primary font-medium backdrop-blur-sm border-b border-border/20"
        )}
      >
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

      <div className="p-2 h-full overflow-y-auto scrollbar-hide">
        {files.map((file, index) => {
          const isCurrentFile = file.path === currentFilePath;
          const { isTodo, isCompleted, isRead, depth, path } = file;

          return (
            <CategoryFile
              key={path}
              file={{
                ...file,
                isTodo: isTodo,
                isCompleted: isCompleted,
                isRead: isRead,
              }}
              depth={depth}
              isCurrentFile={isCurrentFile}
              fileNumber={index + 1}
              handleSelectFile={onSelectFile}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CurrentlyReading;
