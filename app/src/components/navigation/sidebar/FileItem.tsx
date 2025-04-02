import { FileMetadata } from "@/utils/MarkdownLoader";
import { cn } from "@/lib/utils";
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
  const fileName = file.path.split("/").pop() ?? file.path;
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
        <span className="break-words leading-tight group-hover:text-indigo-300 text-sm">
          {file.title || fileName}
        </span>

        <div className="flex-grow"></div>
      </div>
    </button>
  );
};

export default FileItem;
