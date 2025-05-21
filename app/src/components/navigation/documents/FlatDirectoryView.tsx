import React from "react";
import { Category, FileMetadata } from "@/services/document";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  BookMarked,
  Clock,
  CheckCircle,
  CircleDot,
} from "lucide-react";
import { getIconForTech } from "@/components/shared/icons/iconMap";
import getTopicIcon from "@/components/shared/icons/topicIcon";

interface FlatDirectoryViewProps {
  categories: Category[];
  files: FileMetadata[];
  onSelectCategory: (categoryId: string) => void;
  onSelectFile: (filePath: string) => void;
  filePaths: {
    read: Set<string>;
    todo: Set<string>;
    completed: Set<string>;
  };
  currentFilePath?: string;
}

/**
 * FlatDirectoryView Component
 *
 * Displays the contents of the current directory in a flat, list-based layout.
 * Shows both subdirectories and files with appropriate styling and status indicators.
 */
const FlatDirectoryView: React.FC<FlatDirectoryViewProps> = ({
  categories,
  files,
  onSelectCategory,
  onSelectFile,
  filePaths,
  currentFilePath,
}) => {
  if (categories.length === 0 && files.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/20 shadow-sm rounded-xl p-6 text-center"
      >
        <div className="bg-primary/5 p-3 rounded-full inline-block mb-3">
          {/* Using the specialized icon system */}
          {React.createElement(getIconForTech("folder"), {
            size: 28,
            className: "text-primary",
          })}
        </div>
        <h4 className="text-sm font-medium mb-2">Empty Directory</h4>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          There are no documents or subdirectories here.
        </p>
      </motion.div>
    );
  }

  // Animation variants for container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  // Get appropriate icon for a file status
  const getFileStatusIcon = (
    isInTodo: boolean,
    isCompleted: boolean,
    isRead: boolean
  ) => {
    switch (true) {
      case isCompleted:
        return (
          <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
        );
      case isInTodo:
        return <BookMarked size={12} className="text-primary flex-shrink-0" />;
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

  // Get file status text
  const getFileStatusText = (
    isInTodo: boolean,
    isCompleted: boolean,
    isRead: boolean
  ) => {
    switch (true) {
      case isCompleted:
        return "Completed";
      case isInTodo:
        return "Reading list";
      case isRead:
        return "Previously read";
      default:
        return "Unread";
    }
  };

  // Get file status styles
  const getFileStatus = (
    isInTodo: boolean,
    isCompleted: boolean,
    isRead: boolean
  ) => {
    switch (true) {
      case isCompleted:
        return {
          bgColor: "bg-green-500/10",
          textColor: "text-green-500",
        };
      case isInTodo:
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-1"
    >
      {/* Categories section */}
      {categories.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Directories
          </div>
          <div className="space-y-1">
            {categories.map((category) => {
              // Use the app's existing icon system
              const CategoryIcon = category.id
                ? getIconForTech(category.id)
                : () => getTopicIcon(category.name);

              return (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => onSelectCategory(category.id)}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-primary/5 text-sm transition-all"
                  >
                    <div className="mr-3 text-primary">
                      <CategoryIcon size={18} />
                    </div>
                    <span className="font-medium truncate flex-1 text-left">
                      {category.name}
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground ml-2"
                    />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files section */}
      {files.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Files {files.length > 0 && `(${files.length})`}
          </div>
          <div className="space-y-1">
            {files.map((file, index) => {
              const isCurrentFile = file.path === currentFilePath;
              const isInTodo = filePaths.todo.has(file.path);
              const isCompleted = filePaths.completed.has(file.path);
              const isRead = filePaths.read.has(file.path);

              const fileStatusIcon = getFileStatusIcon(
                isInTodo,
                isCompleted,
                isRead
              );
              const statusText = getFileStatusText(
                isInTodo,
                isCompleted,
                isRead
              );
              const fileStatus = getFileStatus(isInTodo, isCompleted, isRead);

              // Extract the category from the file path to use the correct icon
              const filePathParts = file.path.split("/");
              const fileCategory =
                filePathParts.length > 0 ? filePathParts[0] : "";
              const FileIcon = getIconForTech(fileCategory);

              return (
                <motion.div
                  key={file.path}
                  variants={itemVariants}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => onSelectFile(file.path)}
                    className={cn(
                      "w-full flex items-center px-3 py-2.5 rounded-lg transition-all",
                      isCurrentFile
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary/20"
                    )}
                  >
                    <div className="flex-shrink-0 mr-3">
                      <FileIcon
                        size={18}
                        className={
                          isCurrentFile
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center">
                        <span className="font-medium mr-1">{index + 1}.</span>
                        <span className="truncate">{file.title}</span>
                      </div>

                      <div className="flex items-center mt-1">
                        <div
                          className={cn(
                            "flex items-center px-1.5 py-0.5 rounded-full text-xs",
                            fileStatus.bgColor
                          )}
                        >
                          {fileStatusIcon}
                          <span className={cn("ml-1", fileStatus.textColor)}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FlatDirectoryView;
