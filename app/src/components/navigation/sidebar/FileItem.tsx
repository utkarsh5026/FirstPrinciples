import { Badge } from "@/components/ui/badge";
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
 *
 * Props:
 * - file (FileMetadata): The file object containing details about the file, including
 *   its path and title.
 * - indent (number): The indentation level for nested files, used to visually represent
 *   the hierarchy in the navigation.
 * - isActive (boolean): A flag indicating whether the file is currently selected.
 * - onSelectFile (function): A callback function that is called when the user selects
 *   the file. It receives the file path as an argument.
 *
 * Hooks Used:
 * - React.FC: This is a TypeScript type for functional components in React. It allows
 *   you to define the props that the component will receive and ensures type safety.
 *
 * - cn: A utility function that combines class names conditionally. It helps manage
 *   dynamic class names based on the component's state or props.
 *
 * Component Logic:
 * - The component extracts the file name from the file path and determines the file
 *   extension.
 * - It applies conditional styling based on whether the file is active or not.
 * - The component renders the file title and extension, and handles click events to
 *   select the file.
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
          ? "bg-primary/15 text-primary"
          : "text-gray-300 hover:text-white hover:bg-[#252836]/50",
        "group my-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      )}
      style={{ paddingLeft: `${indent * 16 + 8}px` }}
      onClick={() => onSelectFile(file.path)}
    >
      <div className="flex items-center w-full py-2 px-2 justify-start">
        <span className="truncate text-left group-hover:text-indigo-300">
          {file.title || fileName}
        </span>
        <div className="flex-1"></div>
        {fileExt && (
          <Badge
            variant="outline"
            className="ml-2 text-xs h-5 bg-indigo-500/10 text-indigo-400 border-indigo-400/20"
          >
            {fileExt}
          </Badge>
        )}
      </div>
    </button>
  );
};

export default FileItem;
