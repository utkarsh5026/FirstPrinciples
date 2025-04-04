import React from "react";
import ThemeSelector from "@/components/theme/selector/ThemeSelector";
import { Button } from "@/components/ui/button";
import { Download, Share, Maximize2 } from "lucide-react";
import { useTheme } from "@/components/theme/context/ThemeContext";

interface ActionButtonsProps {
  toggleFullscreen: () => void;
  handleDownload: () => void;
  handleCopyLink: () => void;
  copied: boolean;
}

/**
 * ActionButtons component renders a set of action buttons for document viewer.
 * It includes buttons for toggling fullscreen mode, downloading the document,
 * and copying the document link for sharing.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.toggleFullscreen - Function to toggle the fullscreen mode.
 * @param {Function} props.handleDownload - Function to handle document download.
 * @param {Function} props.handleCopyLink - Function to handle copying the document link.
 * @param {boolean} props.copied - Indicates if the document link has been copied.
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  toggleFullscreen,
  handleDownload,
  handleCopyLink,
  copied,
}) => {
  /**
   * Hook to get the current theme and set a new theme.
   *
   * @returns {Object} - An object containing the current theme and a function to set a new theme.
   */
  const { currentTheme, setTheme } = useTheme();
  return (
    <div className="px-4 sm:px-6 py-4 border-b border-border/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-type-mono">
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <div className="flex gap-2 font-cascadia-code">
          {/* Theme selector button */}
          <ThemeSelector
            currentTheme={currentTheme.name}
            onThemeChange={setTheme}
          />

          {/* Fullscreen button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 sm:w-auto sm:px-3 rounded-full sm:rounded-md"
            title="Fullscreen mode"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">Fullscreen</span>
          </Button>

          {/* Download button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 w-8 sm:w-auto sm:px-3 rounded-full sm:rounded-md"
            title="Download document"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">Download</span>
          </Button>

          {/* Share button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 w-8 sm:w-auto sm:px-3 rounded-full sm:rounded-md relative"
            title="Copy link to document"
          >
            <Share className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">
              {copied ? "Copied!" : "Share"}
            </span>
            {copied && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                ✓
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
