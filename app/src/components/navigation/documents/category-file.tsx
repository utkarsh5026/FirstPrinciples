import { cn } from "@/lib/utils";
import type { FileMetadata } from "@/services/document";
import { fromSnakeToTitleCase } from "@/utils/string";

type CategoryFileWithStatus = FileMetadata & {
  isTodo: boolean;
  isCompleted: boolean;
  isRead: boolean;
};

interface CategoryFileProps {
  file: CategoryFileWithStatus;
  depth: number;
  isCurrentFile: boolean;
  fileNumber: number;
  handleSelectFile: (filePath: string) => void;
}

const CategoryFile: React.FC<CategoryFileProps> = ({
  file,
  depth,
  isCurrentFile,
  handleSelectFile,
  fileNumber,
}: CategoryFileProps) => {
  const statusMarker = getStatusMarker(
    file.isTodo,
    file.isCompleted,
    file.isRead
  );

  return (
    <button
      className={cn(
        "relative w-full text-left transition-all duration-200 ease-out",
        "border border-transparent rounded-lg",
        "hover:bg-accent/30 active:bg-accent/50",
        "min-h-[48px] px-3 py-2.5",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        isCurrentFile && ["bg-primary/5 border-primary/15", "shadow-sm"],
        file.isRead && !isCurrentFile && !file.isCompleted && "opacity-60"
      )}
      style={{
        paddingLeft: `${12 + depth * 16}px`,
      }}
      onClick={() => handleSelectFile(file.path)}
    >
      <div className="flex items-start gap-3">
        {/* File number */}
        <div
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5",
            "text-xs font-medium transition-colors",
            isCurrentFile
              ? "bg-primary/10 text-primary"
              : "bg-muted/60 text-muted-foreground"
          )}
        >
          {fileNumber}
        </div>

        {/* File content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "font-medium text-sm leading-relaxed",
                "transition-colors duration-200",
                "break-words hyphens-auto",
                isCurrentFile ? "text-primary" : "text-foreground"
              )}
            >
              {fromSnakeToTitleCase(file.title)}
            </h4>

            {/* Status marker */}
            <div className="flex-shrink-0 mt-1.5">{statusMarker}</div>
          </div>
        </div>
      </div>

      {/* Active indicator */}
      {isCurrentFile && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-sm" />
      )}
    </button>
  );
};

// Simplified status markers
const getStatusMarker = (
  isTodo: boolean,
  isCompleted: boolean,
  isRead: boolean
) => {
  if (isCompleted) {
    return (
      <div className="w-2 h-2 rounded-full bg-green-400 ring-2 ring-green-100" />
    );
  }

  if (isTodo) {
    return (
      <div className="w-2 h-2 rounded-full bg-blue-400 ring-2 ring-blue-100" />
    );
  }

  if (isRead) {
    return (
      <div className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-100" />
    );
  }

  return <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />;
};

export default CategoryFile;
