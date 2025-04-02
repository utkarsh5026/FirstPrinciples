import { Badge } from "@/components/ui/badge";
import { FileMetadata } from "@/utils/MarkdownLoader";
import { cn } from "@/lib/utils";
import { BookUp } from "lucide-react";
interface FileItemProps {
  file: FileMetadata;
  indent: number;
  isActive: boolean;
  onSelectFile: (filepath: string) => void;
}

/**
 * FileItem Component
 *
 * This component represents a single file item in the file navigation sidebar.
 * It displays the file's title, its extension, and allows users to select the file
 * by clicking on it. The component also visually indicates whether the file is currently
 * active (selected) or not.
 */
const FileItem: React.FC<FileItemProps> = ({
  file,
  indent,
  isActive,
  onSelectFile,
}) => {
  // Extract the file name from the file path
  const fileName = file.path.split("/").pop() ?? file.path;
  // Extract the file extension from the file name
  const fileExt = fileName.split(".").pop()?.toLowerCase();

  return (
    <button
      key={file.path}
      className={cn(
        "flex items-center rounded-md text-sm cursor-pointer transition-colors w-full text-left",
        isActive
          ? "bg-indigo-500/15 text-indigo-300"
          : "text-gray-300 hover:text-white hover:bg-[#252836]/50",
        "group my-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      )}
      style={{ paddingLeft: `${indent * 12 + 8}px` }}
      onClick={() => onSelectFile(file.path)}
    >
      <div className="flex items-center w-full py-2 px-2 justify-start">
        <div className="flex-shrink-0 mr-2">
          <BookUp className="text-indigo-400" />
        </div>

        <span className="break-words leading-tight group-hover:text-indigo-300 text-sm">
          {file.title || fileName}
        </span>

        <div className="flex-grow"></div>

        {fileExt && (
          <Badge
            variant="outline"
            className="ml-2 text-xs h-5 bg-indigo-500/10 text-indigo-400 border-indigo-400/20 flex-shrink-0"
          >
            {fileExt}
          </Badge>
        )}
      </div>
    </button>
  );
};

export default FileItem;
