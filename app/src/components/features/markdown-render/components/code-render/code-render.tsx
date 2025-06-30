import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Copy,
  ChevronDown,
  ChevronRight,
  Check,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import getIconForTech from "@/components/shared/icons/";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCodeThemeStore } from "@/stores/ui/code-theme";
import { Button } from "@/components/ui/button";
import { downloadAsFile, downloadAsImage } from "@/utils/download";
import { Badge } from "@/components/ui/badge";
import CodePreviewDrawer from "./code-preview-drawer";
import CodeDisplay from "./code-display";

interface CodeRenderProps extends React.ComponentPropsWithoutRef<"code"> {
  inline?: boolean;
}

const getHeadingCodeStyle = (headingLevel: number | null) => {
  if (!headingLevel) return "text-sm sm:text-base";
  const sizes = {
    1: "text-xl sm:text-3xl",
    2: "text-lg sm:text-2xl",
    3: "text-base sm:text-xl",
  };
  return `${
    sizes[headingLevel as keyof typeof sizes]
  } mx-1 sm:mx-2 px-2 py-1 bg-primary/10 rounded-xl sm:rounded-2xl`;
};

const CodeRender: React.FC<CodeRenderProps> = ({
  inline,
  className,
  children,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [downloading, setDownloading] = useState<"image" | "file" | null>(null);

  const match = /language-(\w+)/.exec(className ?? "");
  const language = match ? match[1] : "";
  const { getCurrentThemeStyle } = useCodeThemeStore();

  const codeRef = useRef<HTMLDivElement>(null);
  const drawerCodeRef = useRef<HTMLDivElement | null>(null);

  const [isInTableCell, setIsInTableCell] = useState(false);
  const [headingLevel, setHeadingLevel] = useState<number | null>(null);

  /**
   * Context Detection Logic
   *
   * This effect analyzes the component's DOM position to determine
   * if it's inside a table cell or heading, which affects rendering style.
   * We traverse up to 3 parent elements to find context clues.
   */
  useEffect(() => {
    if (codeRef.current) {
      let parent = codeRef.current.parentElement;
      let cnt = 0;

      while (parent && cnt < 3) {
        const tagName = parent.tagName.toLowerCase().trim();

        // Check if code is inside a table cell
        if (tagName === "td") {
          setIsInTableCell(true);
          return;
        }

        // Check if code is inside a heading
        if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
          setHeadingLevel(parseInt(tagName.slice(1)));
          return;
        }

        parent = parent.parentElement;
        cnt++;
      }
      setIsInTableCell(false);
    }
  }, []);

  const codeContent = useMemo(() => {
    return typeof children === "string"
      ? children.replace(/\n$/, "") // Remove trailing newline
      : React.Children.toArray(children).join("");
  }, [children]);

  const isCompactCode =
    typeof codeContent === "string" &&
    !codeContent.includes("\n") &&
    codeContent.length < 25;

  const isLargeCode =
    typeof codeContent === "string" &&
    (codeContent.split("\n").length > 20 || codeContent.length > 500);

  /**
   * Copy to Clipboard Functionality
   *
   * Copies the code content to user's clipboard and provides
   * visual feedback with a temporary success state.
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  /**
   * Download as Image Functionality
   *
   * Converts the code display to a canvas and downloads it as PNG.
   * Handles horizontal overflow by temporarily expanding the container.
   */
  const handleDownloadAsImage = () => {
    setDownloading("image");
    if (drawerCodeRef.current) {
      downloadAsImage(drawerCodeRef.current, language).then(() => {
        setDownloading(null);
      });
    } else {
      setDownloading(null);
    }
  };

  /**
   * Download as File Functionality
   *
   * Creates a text file with the code content and triggers download.
   * File extension is determined by the detected language.
   */
  const handleDownloadAsFile = () => {
    setDownloading("file");
    downloadAsFile(codeContent, language);
    setDownloading(null);
  };

  const showSimpleCode = isInTableCell || (!inline && isCompactCode);

  if (showSimpleCode) {
    return (
      <span ref={codeRef}>
        <code
          className={cn(
            "px-2 py-1 text-primary font-cascadia-code break-words",
            getHeadingCodeStyle(headingLevel)
          )}
        >
          {codeContent}
        </code>
      </span>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        ref={codeRef}
        className="my-8 relative font-fira-code no-swipe shadow-background/50 rounded-2xl border-none"
      >
        {/* Code Block Header */}
        <div className="bg-card text-muted-foreground px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold border-b border-border flex justify-between items-center rounded-t-2xl">
          {/* Language indicator with icon */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <span className="flex-shrink-0">
              {(() => {
                const IconComponent = getIconForTech(language || "code");
                return <IconComponent className="w-4 h-4" />;
              })()}
            </span>
            {isLargeCode && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-none rounded-full"
              >
                {codeContent.split("\n").length} lines
              </Badge>
            )}
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Copy Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 px-2 transition-all duration-300 cursor-pointer"
              aria-label={copied ? "Copied!" : "Copy code"}
            >
              <div className="relative">
                <Copy
                  size={14}
                  className={cn(
                    "transition-all duration-300",
                    copied
                      ? "opacity-0 scale-0 rotate-90"
                      : "opacity-100 scale-100 rotate-0"
                  )}
                />
                <Check
                  size={14}
                  className={cn(
                    "absolute inset-0 transition-all duration-300 text-green-400",
                    copied
                      ? "opacity-100 scale-100 rotate-0"
                      : "opacity-0 scale-0 -rotate-90"
                  )}
                />
              </div>
            </Button>

            {/* Expand to Drawer Button - Show for large code blocks */}
            {isLargeCode && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 cursor-pointer"
                aria-label="Open in drawer"
                onClick={() => setDrawerOpen(true)}
              >
                <Maximize2 size={14} />
              </Button>
            )}

            {/* Collapse Toggle */}
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 cursor-pointer"
                aria-label={isOpen ? "Collapse code" : "Expand code"}
              >
                {isOpen ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        {/* Collapsible Code Content */}
        <CollapsibleContent className="data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down rounded-2xl">
          {isLargeCode ? (
            /* Preview for large code blocks */
            <div
              className="relative cursor-pointer group"
              onClick={() => setDrawerOpen(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-background/90 backdrop-blur-sm border-primary/20 hover:bg-primary/10 rounded-2xl"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  View Full Code
                </Button>
              </div>
              <div className="overflow-hidden relative max-h-[300px] rounded-2xl">
                <CodeDisplay
                  language={language}
                  codeContent={codeContent}
                  themeStyle={getCurrentThemeStyle()}
                  props={{ ...props }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
              </div>
            </div>
          ) : (
            /* Regular code display for smaller blocks */
            <CodeDisplay
              language={language}
              codeContent={codeContent}
              themeStyle={getCurrentThemeStyle()}
              props={{ ...props }}
            />
          )}
        </CollapsibleContent>
      </div>

      {/* Code Preview Drawer */}
      <CodePreviewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        language={language}
        codeContent={codeContent}
        onDownloadAsImage={handleDownloadAsImage}
        onDownloadAsFile={handleDownloadAsFile}
        downloading={downloading}
        onCopy={copyToClipboard}
        copied={copied}
        drawerCodeRef={drawerCodeRef}
        props={props}
        themeStyle={getCurrentThemeStyle()}
      />
    </Collapsible>
  );
};

export default CodeRender;
