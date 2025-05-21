import { cn } from "@/lib/utils";
import { CircleDot, BookMarked, Clock, CheckCircle } from "lucide-react";
import type { FileMetadata } from "@/services/document";
import { fromSnakeToTitleCase } from "@/utils/string";

interface CategoryFileProps {
  file: FileMetadata;
  depth: number;
  isCurrentFile: boolean;
  isTodo: boolean;
  isCompleted: boolean;
  isRead: boolean;
  fileNumber: number;
  handleSelectFile: (filePath: string) => void;
}

const CategoryFile: React.FC<CategoryFileProps> = ({
  file,
  depth,
  isCurrentFile,
  isTodo,
  isCompleted,
  isRead,
  handleSelectFile,
  fileNumber,
}: CategoryFileProps) => {
  const fileStatusIcon = getFileStatusIcon(isTodo, isCompleted, isRead);
  const statusText = getFileStatusText(isTodo, isCompleted, isRead);

  const fileStatus = getFileStatus(isTodo, isCompleted, isRead);

  return (
    <div className="px-1 my-1">
      <button
        key={file.path}
        className={cn(
          "flex flex-col w-full rounded-xl text-sm cursor-pointer transition-all py-2 px-3 relative",
          "text-left focus:outline-none focus:ring-1 focus:ring-primary/30 active:scale-98",
          isCurrentFile
            ? "bg-primary/15 text-primary font-medium shadow-sm"
            : "hover:bg-secondary/30 hover:shadow-sm text-foreground hover:text-foreground",
          isRead && !isCurrentFile && !isCompleted && "text-muted-foreground"
        )}
        style={{ paddingLeft: `${(depth + 1) * 16}px` }}
        onClick={() => handleSelectFile(file.path)}
      >
        <div className="flex flex-col min-w-0 flex-grow">
          {/* File name with number */}
          <div className="flex items-center text-foreground/80">
            <span className="font-medium mr-1">{fileNumber}.</span>
            <span className="break-words w-full text-xs">
              {fromSnakeToTitleCase(file.title)}
            </span>
          </div>

          {/* Status info with badge */}
          <div className="flex items-center mt-1.5 gap-1">
            <div
              className={cn(
                "flex items-center px-1.5 py-0.5 rounded-full text-xs",
                fileStatus.bgColor
              )}
            >
              <div className="flex-shrink-0 mr-1">{fileStatusIcon}</div>
              <span className={cn("break-words", fileStatus.textColor)}>
                {statusText}
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
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
      return <Clock size={12} className="text-green-200 flex-shrink-0" />;
    default:
      return (
        <CircleDot
          size={12}
          className="text-muted-foreground/40 flex-shrink-0"
        />
      );
  }
};

const getFileStatusText = (
  isTodo: boolean,
  isCompleted: boolean,
  isRead: boolean
) => {
  switch (true) {
    case isCompleted:
      return "Completed";
    case isTodo:
      return "Reading list";
    case isRead:
      return "Previously read";
    default:
      return "Unread";
  }
};

const getFileStatus = (
  isTodo: boolean,
  isCompleted: boolean,
  isRead: boolean
) => {
  switch (true) {
    case isCompleted:
      return {
        bgColor: "bg-green-500/10",
        textColor: "text-green-500",
      };
    case isTodo:
      return {
        bgColor: "bg-primary/10",
        textColor: "text-primary",
      };
    case isRead:
      return {
        bgColor: "bg-green-200/10",
        textColor: "text-green-200",
      };
    default:
      return {
        bgColor: "bg-secondary/20",
        textColor: "text-muted-foreground",
      };
  }
};

export default CategoryFile;
