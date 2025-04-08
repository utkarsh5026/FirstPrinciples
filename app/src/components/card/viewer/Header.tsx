import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { Download, Maximize2, Share2 } from "lucide-react";
import ThemeSelector from "@/components/theme/selector/ThemeSelector";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { fromSnakeToTitleCase } from "@/utils/string";
import getIconForTech from "@/components/icons";

interface HeaderProps {
  documentTitle: string;
  markdownContent: string;
  estimatedReadTime: number;
  selectedFile: string;
  toggleFullscreen: () => void;
}

/**
 * The Header component is a delightful part of our document viewer! 🌟
 * It showcases the document title, reading time, and provides handy buttons
 * for sharing, downloading, and changing themes. 🎉
 *
 * With this component, users can easily navigate their reading experience
 * while enjoying a visually appealing interface. 💖
 */
const Header: React.FC<HeaderProps> = ({
  documentTitle,
  markdownContent,
  estimatedReadTime,
  selectedFile,
  toggleFullscreen,
}) => {
  const [copied, setCopied] = useState(false);
  const { currentTheme, setTheme } = useTheme();

  /**
   * This function allows users to share the document by copying a link
   * to their clipboard. 📋✨
   */
  const handleCopyLink = useCallback(() => {
    if (!selectedFile) return;

    const slug = selectedFile.endsWith(".md")
      ? selectedFile.slice(0, -3)
      : selectedFile;
    const url = `${window.location.origin}${window.location.pathname}#${slug}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selectedFile]);

  /**
   * This function handles the downloading of the document, making it easy
   * for users to save their reading material. 📥💾
   */
  const handleDownload = useCallback(() => {
    if (!selectedFile || !markdownContent) return;
    const downloadFilename = selectedFile.split("/").pop() ?? "document.md";
    MarkdownLoader.downloadMarkdown(downloadFilename, markdownContent);
  }, [selectedFile, markdownContent]);

  const CategoryIcon = getIconForTech(selectedFile.split("/")[0]);

  return (
    <div className="mb-4 px-1 font-cascadia-code">
      <div className="bg-card border border-border/40 rounded-4xl shadow-sm overflow-hidden">
        <div className="relative overflow-hidden">
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(to right, ${currentTheme.primary}99, transparent)`,
            }}
          />

          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold mb-1 truncate">
                  {documentTitle}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {/* Document category/path */}
                  <div className="flex items-center gap-2 text-primary">
                    <CategoryIcon className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">
                      {selectedFile
                        .split("/")
                        .slice(0, -1)
                        .map(fromSnakeToTitleCase)
                        .join("/")}
                    </span>
                  </div>

                  {/* Reading time */}
                  <div className="flex items-center">
                    <span className="inline-flex items-center gap-1 text-xs px-3 py-0.5 rounded-full bg-primary/10 text-primary-foreground/90">
                      {estimatedReadTime} min read
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-3 border-t border-border/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-cascadia-code">
          <div className="flex-1" />
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <TooltipProvider>
              {/* Theme selector button */}
              <ButtonsToolTip tooltipText="Change theme">
                <div>
                  <ThemeSelector
                    currentTheme={currentTheme.name}
                    onThemeChange={setTheme}
                  />
                </div>
              </ButtonsToolTip>

              <ButtonsToolTip tooltipText="Enter fullscreen mode">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded-full sm:rounded-lg"
                >
                  <Maximize2 className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </Button>
              </ButtonsToolTip>

              {/* Download button */}
              <ButtonsToolTip tooltipText="Download document">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded-full sm:rounded-lg"
                >
                  <Download className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </ButtonsToolTip>

              {/* Share button */}
              <ButtonsToolTip tooltipText="Copy link to document">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded-full sm:rounded-lg relative"
                >
                  <Share2 className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">
                    {copied ? "Copied!" : "Share"}
                  </span>
                  {copied && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
                    >
                      ✓
                    </motion.span>
                  )}
                </Button>
              </ButtonsToolTip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ButtonsToolTipProps {
  children: React.ReactNode;
  tooltipText: string;
}

/**
 * ButtonsToolTip is a delightful component that wraps around any child element
 * and provides a friendly tooltip to enhance user experience! 🌟✨
 *
 * When users hover over the wrapped element, they will see a helpful tooltip
 * that gives them more context about the action they can take. It's like a
 * little guide that pops up to say, "Hey, this is what you can do!" 😊
 *
 * This component makes interactions more intuitive and fun, ensuring users
 * feel supported while navigating through the interface. 💖
 */
const ButtonsToolTip: React.FC<ButtonsToolTipProps> = ({
  children,
  tooltipText,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" className="rounded-2xl">
        <p className="text-xs font-cascadia-code">{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};
export default Header;
