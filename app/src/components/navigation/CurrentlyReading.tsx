import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import CategoryFile from "./CategoryFile";
import type { CurrentCategory } from "./hooks/use-navigate";
import getIconForTech from "@/components/icons/iconMap";

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

  return (
    <div className="mb-4 mt-2">
      <div className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-1">
        Currently Reading
      </div>
      <Collapsible
        open={expanded}
        onOpenChange={setExpanded}
        className="border border-border/60 rounded-md overflow-hidden bg-secondary/10"
      >
        <CollapsibleTrigger className="w-full">
          <div
            className={cn(
              "group flex items-center w-full rounded-t-md text-sm transition-colors py-2 px-3",
              "bg-primary/10 text-primary font-medium"
            )}
          >
            <div className="mr-1.5 text-primary flex-shrink-0">
              {expanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </div>
            <CategoryIcon size={16} className="mr-2 text-primary" />
            <span className="truncate">{name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {files.length} {files.length === 1 ? "file" : "files"}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-1 max-h-64 overflow-y-auto scrollbar-hide">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CurrentlyReading;
