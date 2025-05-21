import React from "react";
import { Category as CategoryType, FileMetadata } from "@/services/document";
import { motion } from "framer-motion";
import { getIconForTech } from "@/components/shared/icons/iconMap";
import Category from "./Category";
import CategoryFile from "./CategoryFile";

interface FlatDirectoryViewProps {
  categories: CategoryType[];
  files: FileMetadata[];
  onSelectCategory: (categoryId: string) => void;
  onSelectFile: (filePath: string) => void;
  filePaths: {
    read: Set<string>;
    todo: Set<string>;
    completed: Set<string>;
  };
  currentFilePath?: string;
  parentCategory?: string;
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
  parentCategory,
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
            Categories
          </div>
          <div className="space-y-1">
            {categories.map((category, index) => {
              return (
                <motion.div
                  variants={itemVariants}
                  key={category.id}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                    cursor: "pointer",
                  }}
                >
                  <Category
                    parentCategory={parentCategory}
                    category={category}
                    key={category.id}
                    depth={1}
                    isExpanded={false}
                    handleToggleExpand={onSelectCategory}
                    stats={{
                      readFilesCount: 0,
                      completedFilesCount: 0,
                      todoFilesCount: 0,
                      totalFilesCount: category.files?.length ?? 0,
                    }}
                    colorIcon={true}
                  />
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

              return (
                <motion.div
                  variants={itemVariants}
                  key={file.path}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  className="rounded-2xl overflow-hidden relative hover:bg-primary/5 border border-transparent hover:border-primary/10"
                  initial={{
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <CategoryFile
                    file={file}
                    isTodo={isInTodo}
                    isCompleted={isCompleted}
                    depth={0}
                    isCurrentFile={isCurrentFile}
                    fileNumber={index + 1}
                    isRead={isRead}
                    handleSelectFile={onSelectFile}
                  />
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
