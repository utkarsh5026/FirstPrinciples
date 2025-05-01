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

  // Determine color indicator class
  const statusColorClass = cn(
    "absolute left-0 top-0 bottom-0 w-1 rounded-l-sm",
    isCompleted && "bg-green-500/70",
    isTodo && !isCompleted && "bg-primary/70",
    isRead && !isTodo && !isCompleted && "bg-green-400/70" // Changed to green for read documents
  );

  // Determine the text color for status
  const statusTextClass = cn(
    "text-xs",
    isCompleted && "text-green-500",
    isTodo && !isCompleted && "text-primary",
    isRead && !isTodo && !isCompleted && "text-green-400",
    !isRead && !isTodo && !isCompleted && "text-muted-foreground"
  );

  return (
    <button
      key={file.path}
      className={cn(
        "flex flex-col w-full rounded-md text-sm cursor-pointer transition-colors py-2 px-2 my-1 relative",
        "text-left focus:outline-none focus:ring-1 focus:ring-primary/30",
        isCurrentFile
          ? "bg-primary/15 text-primary font-medium"
          : "hover:bg-secondary/20 text-muted-foreground hover:text-foreground",
        isRead && !isCurrentFile && "text-muted-foreground"
      )}
      style={{ paddingLeft: `${(depth + 1) * 16}px`, paddingRight: "8px" }}
      onClick={() => handleSelectFile(file.path)}
    >
      {/* Color indicator bar */}
      {(isTodo || isCompleted || isRead) && (
        <span className={statusColorClass} />
      )}

      <div className="flex flex-col min-w-0 flex-grow pl-1">
        {/* File name with number - using break-words instead of truncate */}
        <span className="break-words w-full">
          {fileNumber}. {file.title}
        </span>

        {/* Status info directly under filename */}
        <div className="flex items-start mt-0.5 gap-1">
          <div className="flex-shrink-0 mt-0.5">{fileStatusIcon}</div>
          <span className={cn(statusTextClass, "break-words")}>
            {statusText}
          </span>
        </div>

        {/* Description if enabled and available - using break-words */}
        {showDescriptions && file.description && (
          <span className="text-xs text-muted-foreground mt-1 break-words w-full">
            {file.description}
          </span>
        )}
      </div>
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
      return <Clock size={12} className="text-green-400 flex-shrink-0" />; // Changed to green
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
