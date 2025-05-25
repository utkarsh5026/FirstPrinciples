import React from "react";
import { FileMetadata } from "@/services/document";
import { motion } from "framer-motion";
import { getIconForTech } from "@/components/shared/icons/iconMap";
import Category from "./Category";
import CategoryFile from "./CategoryFile";
import type { Document } from "@/stores/document/document-store";
interface FlatDirectoryViewProps {
  categories: Document[];
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
                    stiffness: 400,
                    damping: 15,
                  }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow:
                      "0 15px 30px -10px rgba(var(--secondary), 0.35), 0 10px 20px -10px rgba(var(--secondary-rgb), 0.25)",
                    transition: { duration: 0.3 },
                    cursor: "pointer",
                  }}
                  className="rounded-2xl overflow-hidden relative border border-transparent hover:border-secondary/30 group backdrop-blur-lg hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                  initial={{
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tl from-secondary/10 via-transparent to-secondary/15 pointer-events-none transition-all duration-500 z-0">
                    <div className="absolute inset-0 bg-[conic-gradient(at_bottom_right,rgba(var(--secondary-rgb),0.1)_30deg,transparent_80deg,rgba(var(--secondary-rgb),0.07)_180deg,transparent_270deg,rgba(var(--secondary-rgb),0.1)_300deg)] mix-blend-screen"></div>
                    <div className="absolute -inset-1 opacity-20 bg-[linear-gradient(115deg,transparent_20%,rgba(var(--secondary-rgb),0.2)_40%,rgba(var(--secondary-rgb),0.4)_60%,transparent_80%)] animate-shimmer-slow blur-xl"></div>
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-secondary/40 to-transparent"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-secondary/30 to-transparent"></div>
                  </div>
                  <Category
                    category={category}
                    key={category.id}
                    depth={1}
                    isExpanded={false}
                    handleToggleExpand={onSelectCategory}
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
                    boxShadow:
                      "0 10px 25px -5px rgba(var(--primary-rgb), 0.3), 0 8px 15px -6px rgba(var(--primary-rgb), 0.2)",
                    transition: { duration: 0.3 },
                  }}
                  className="rounded-2xl overflow-hidden relative border border-transparent hover:border-primary/30 group backdrop-blur-sm"
                  initial={{
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/10 via-transparent to-primary/20 pointer-events-none transition-all duration-500 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(var(--primary-rgb),0.15)_0%,transparent_70%)] mix-blend-overlay"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  </div>
                  <CategoryFile
                    file={{
                      ...file,
                      isTodo: isInTodo,
                      isCompleted: isCompleted,
                      isRead: isRead,
                    }}
                    depth={0}
                    isCurrentFile={isCurrentFile}
                    fileNumber={index + 1}
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
