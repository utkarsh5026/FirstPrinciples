import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, File, FileText, Terminal } from "lucide-react";
import getTopicIcon from "@/components/shared/icons/topicIcon";

interface TreeNode {
  name: string;
  pathsoFar: string;
  type: "folder" | "file";
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children?: TreeNode[];
  depth: number;
}

const buildDirectoryTree = (path: string): TreeNode => {
  const segments = path.split("/").filter(Boolean);

  const buildNode = (segmentIndex: number): TreeNode => {
    const segment = segments[segmentIndex];
    const isFile =
      segmentIndex === segments.length - 1 && segment.includes(".");

    const pathSoFar = segments.slice(0, segmentIndex + 1).join("/");

    const node: TreeNode = {
      name: segment,
      pathsoFar: pathSoFar,
      type: isFile ? "file" : "folder",
      icon: isFile ? FileText : () => getTopicIcon(pathSoFar),
      depth: segmentIndex,
      children:
        segmentIndex < segments.length - 1
          ? [buildNode(segmentIndex + 1)]
          : undefined,
    };

    return node;
  };

  return buildNode(0);
};

const TreeItem: React.FC<{
  node: TreeNode;
  isVisible: boolean;
  delay: number;
}> = ({ node, isVisible, delay }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = node.icon || (node.type === "folder" ? Folder : File);

  useEffect(() => {
    if (isVisible && node.type === "folder") {
      const timer = setTimeout(() => {
        setIsExpanded(true);
      }, delay + 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay, node.type]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          transition={{
            duration: 0.4,
            delay: delay / 1000,
            type: "spring",
            stiffness: 120,
            damping: 15,
          }}
          className="space-y-1"
        >
          <div
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-background/20 transition-colors cursor-pointer group"
            style={{ marginLeft: `${node.depth * 20}px` }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Icon
                size={16}
                className={`transition-colors ${
                  node.type === "folder"
                    ? "text-primary/80 group-hover:text-primary"
                    : "text-muted-foreground/80 group-hover:text-foreground"
                }`}
              />
            </motion.div>
            <motion.span
              className={`text-sm font-medium transition-colors ${
                node.type === "folder"
                  ? "text-foreground/90 group-hover:text-foreground"
                  : "text-muted-foreground/80 group-hover:text-foreground/90"
              }`}
              whileHover={{ x: 2 }}
            >
              {node.name}
            </motion.span>
            {node.type === "file" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay / 1000 + 0.2 }}
                className="ml-auto"
              >
                <div className="w-2 h-2 rounded-full bg-green-500/60 animate-pulse" />
              </motion.div>
            )}
          </div>

          {node.children && isExpanded && (
            <div className="space-y-1">
              {node.children.map((child, index) => (
                <TreeItem
                  key={`${child.name}-${index}`}
                  node={child}
                  isVisible={isExpanded}
                  delay={delay + index * 150}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LoadingScreenProps {
  documentPath: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ documentPath }) => {
  const [currentRootIndex, setCurrentRootIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const directoryToShow = [buildDirectoryTree(documentPath)];

  useEffect(() => {
    if (!documentPath) {
      const interval = setInterval(() => {
        setIsAnimating(false);

        setTimeout(() => {
          setCurrentRootIndex(
            (prevIndex) => (prevIndex + 1) % directoryToShow.length
          );
          setIsAnimating(true);
        }, 500);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [documentPath, directoryToShow.length]);

  return (
    <div className="flex flex-col justify-center items-center min-h-[500px] py-12 font-cascadia-code max-w-md mx-auto">
      {/* Header Section */}
      <motion.div
        className="text-center mb-8 space-y-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="relative w-12 h-12 mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute w-full h-full rounded-full border-3 border-t-transparent"
            style={{
              borderColor: "var(--primary) transparent transparent transparent",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        <motion.h2
          className="text-lg font-semibold"
          style={{ color: "var(--foreground)" }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Exploring Knowledge Base...
        </motion.h2>

        <motion.p
          className="text-sm"
          style={{ color: "var(--muted-foreground)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Discovering content structure
        </motion.p>
      </motion.div>

      {/* Animated Directory Tree */}
      <motion.div
        className="w-full max-w-sm bg-card/40 backdrop-blur-sm rounded-2xl border border-border/30 p-4 shadow-lg relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {/* Subtle background animation */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            background: [
              "linear-gradient(45deg, var(--primary)/20, transparent)",
              "linear-gradient(90deg, transparent, var(--primary)/20)",
              "linear-gradient(135deg, var(--primary)/20, transparent)",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10">
          <motion.div
            className="flex items-center gap-2 mb-4 pb-3 border-b border-border/20"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Terminal size={16} className="text-primary/80" />
            <span className="text-sm font-medium text-foreground/80">
              /content/
            </span>
            <motion.div
              className="ml-auto w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          <div className="space-y-1 min-h-[280px]">
            <AnimatePresence mode="wait">
              {isAnimating && (
                <TreeItem
                  key={`root-${currentRootIndex}`}
                  node={directoryToShow[currentRootIndex]}
                  isVisible={isAnimating}
                  delay={0}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
