import { cn } from "@/lib/utils";
import { CircleDot, BookMarked, Clock, CheckCircle } from "lucide-react";
import type { FileMetadata } from "@/services/document";

interface CategoryFileProps {
  file: FileMetadata;
  depth: number;
  isCurrentFile: boolean;
  isTodo: boolean;
  isCompleted: boolean;
  isRead: boolean;
  fileNumber: number;
  handleSelectFile: (filePath: string) => void;
  showDescriptions: boolean;
}

const CategoryFile = ({
  file,
  depth,
  isCurrentFile,
  isTodo,
  isCompleted,
  isRead,
  handleSelectFile,
  showDescriptions,
  fileNumber,
}: CategoryFileProps) => {
  const fileStatusIcon = getFileStatusIcon(isTodo, isCompleted, isRead);
  const statusText = getFileStatusText(isTodo, isCompleted, isRead);
  return (
    <button
      key={file.path}
      className={cn(
        "flex items-start w-full rounded-md text-sm cursor-pointer transition-colors py-2 px-2 my-1",
        "text-left focus:outline-none focus:ring-1 focus:ring-primary/30",
        isCurrentFile
          ? "bg-primary/15 text-primary font-medium"
          : "hover:bg-secondary/20 text-muted-foreground hover:text-foreground",
        isTodo && "border-l-2 border-primary/30 pl-1.5",
        isCompleted && "border-l-2 border-green-500/30 pl-1.5",
        isRead && "text-muted-foreground"
      )}
      style={{ paddingLeft: `${(depth + 1) * 16}px` }}
      onClick={() => handleSelectFile(file.path)}
    >
      <div className="flex flex-col min-w-0 flex-grow">
        <span className="break-words">
          {fileNumber}. {file.title}
        </span>

        {/* Show description if enabled */}
        {showDescriptions && (
          <span className="text-xs text-muted-foreground">{statusText}</span>
        )}
      </div>

      {/* Status indicator */}
      <div className="ml-auto flex-shrink-0 mt-0.5">{fileStatusIcon}</div>
    </button>
  );
};

const getFileStatusIcon = (
  isTodo: boolean,
  isCompleted: boolean,
  isRead: boolean
) => {
  switch (true) {
    case isTodo:
      return <BookMarked size={12} className="text-primary flex-shrink-0" />;
    case isCompleted:
      return <CheckCircle size={12} className="text-green-500 flex-shrink-0" />;
    case isRead:
      return <Clock size={12} className="text-blue-400 flex-shrink-0" />;
    default:
      return (
        <CircleDot
          size={12}
          className="text-muted-foreground/40 flex-shrink-0"
        />
      );
  }
};

// Get file status text
const getFileStatusText = (
  isTodo: boolean,
  isCompleted: boolean,
  isRead: boolean
) => {
  switch (true) {
    case isTodo:
      return "In reading list";
    case isCompleted:
      return "Completed";
    case isRead:
      return "Previously read";
    default:
      return "Unread";
  }
};

export default CategoryFile;
