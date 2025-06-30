import React, { useEffect, useState, useRef, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  Copy,
  ChevronDown,
  ChevronRight,
  Palette,
  Check,
  Maximize2,
  Image,
  FileText,
  WrapText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import getIconForTech from "@/components/shared/icons/";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCodeThemeStore, type ThemeKey } from "@/stores/ui/code-theme";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { downloadAsFile, downloadAsImage } from "@/utils/download";
import { Badge } from "@/components/ui/badge";

interface CodeRenderProps extends React.ComponentPropsWithoutRef<"code"> {
  inline?: boolean;
}

interface CodePreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
  codeContent: string;
  onDownloadAsImage: () => void;
  onDownloadAsFile: () => void;
  downloading: "image" | "file" | null;
  onCopy: () => void;
  copied: boolean;
  drawerCodeRef: React.RefObject<HTMLDivElement | null>;
  themeStyle: Record<string, React.CSSProperties>;
  props?: React.ComponentPropsWithoutRef<typeof SyntaxHighlighter>;
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

/**
 * Code Preview Drawer Component
 *
 * A bottom drawer for better code inspection with download capabilities
 * and theme customization.
 */
const CodePreviewDrawer: React.FC<CodePreviewDrawerProps> = ({
  open,
  onOpenChange,
  language,
  codeContent,
  onDownloadAsImage,
  onDownloadAsFile,
  downloading,
  onCopy,
  copied,
  drawerCodeRef,
  props,
  themeStyle,
}) => {
  const [lineWrap, setLineWrap] = useState(false);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="h-[85vh] sm:h-[90vh] p-0 font-cascadia-code rounded-t-3xl border-none shadow-2xl shadow-black/20 overflow-hidden">
        <DrawerHeader className="relative px-3 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 border-b border-border/50 bg-gradient-to-r from-card/80 via-card/60 to-card/40 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />

          <div className="relative flex items-center justify-between gap-2">
            <DrawerTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent truncate">
              Code Preview
            </DrawerTitle>

            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <div className="flex items-center gap-0.5 sm:gap-2 p-1 bg-card/50 rounded-xl sm:rounded-2xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <WrapText className="w-3.5 h-3.5 text-muted-foreground" />
                  <Switch
                    checked={lineWrap}
                    onCheckedChange={setLineWrap}
                    className="scale-75 sm:scale-100"
                    aria-label="Toggle line wrap"
                  />
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Wrap
                  </span>
                </div>
                <div className="w-px h-6 bg-border/50" />
                <div className="hidden xs:block">
                  <ThemeSelector />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCopy}
                  className="gap-1 sm:gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl sm:rounded-2xl cursor-pointer h-8 px-2 sm:px-3"
                >
                  <div className="relative">
                    <Copy
                      className={cn(
                        "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300",
                        copied
                          ? "opacity-0 scale-0 rotate-90"
                          : "opacity-100 scale-100 rotate-0"
                      )}
                    />
                    <Check
                      className={cn(
                        "absolute inset-0 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300",
                        copied
                          ? "opacity-100 scale-100 rotate-0 text-green-600"
                          : "opacity-0 scale-0 -rotate-90"
                      )}
                    />
                  </div>
                  <span className="hidden md:inline">Copy</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownloadAsImage}
                  disabled={downloading === "image"}
                  className="gap-1 sm:gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl sm:rounded-2xl cursor-pointer h-8 px-2 sm:px-3"
                >
                  {downloading === "image" ? (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden md:inline">Image</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownloadAsFile}
                  disabled={downloading === "file"}
                  className="gap-1 sm:gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 cursor-pointer rounded-xl sm:rounded-2xl h-8 px-2 sm:px-3"
                >
                  {downloading === "file" ? (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden md:inline">File</span>
                </Button>
              </div>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 p-3 sm:p-4 lg:p-6 relative overflow-hidden">
          <ScrollArea className="relative h-[calc(85vh-120px)] sm:h-[calc(90vh-140px)] lg:h-[calc(90vh-180px)] rounded-xl sm:rounded-2xl border border-border/30 overflow-hidden mt-4">
            <CodeDisplay
              isDrawer
              ref={drawerCodeRef}
              themeStyle={themeStyle}
              language={language}
              codeContent={codeContent}
              lineWrap={lineWrap}
              props={{ ...props }}
            />
            <ScrollBar orientation="horizontal" className="bg-muted/50" />
            <ScrollBar orientation="vertical" className="bg-muted/50" />
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * Enhanced CodeRender Component with Drawer View
 *
 * This component provides a comprehensive code rendering solution with:
 * - Syntax highlighting using Prism
 * - Theme customization with real-time preview
 * - Copy functionality with visual feedback
 * - Collapsible code blocks for space efficiency
 * - Bottom drawer view for better code inspection
 * - Download capabilities (as image or code file)
 * - Responsive design for mobile and desktop
 * - Smart detection of inline vs block code
 */
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

/**
 * Theme Selector Component
 *
 * Reusable dropdown component for theme selection with
 * organized categories and current theme indication.
 */
const ThemeSelector = ({
  size = "default",
}: {
  size?: "default" | "small";
}) => {
  const { selectedTheme, setTheme, getCurrentThemeName, getThemesByCategory } =
    useCodeThemeStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === "small" ? "sm" : "icon"}
          className={cn(
            "transition-colors cursor-pointer",
            size === "small" ? "h-8 px-3" : "p-2 h-10 w-10"
          )}
          aria-label="Select theme"
        >
          <Palette className={cn(size === "small" ? "w-3 h-3" : "w-4 h-4")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-52 max-h-64 overflow-y-auto bg-card rounded-2xl font-fira-code"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground px-3 py-2">
          Current: {getCurrentThemeName()}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(getThemesByCategory()).map(([category, themes]) => (
          <React.Fragment key={category}>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
              {category}
            </DropdownMenuLabel>
            {Object.entries(themes).map(([themeKey, theme]) => (
              <DropdownMenuItem
                key={themeKey}
                onClick={() => setTheme(themeKey as ThemeKey)}
                className={cn(
                  "cursor-pointer text-sm py-2.5",
                  selectedTheme === themeKey &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{theme.name}</span>
                  {selectedTheme === themeKey && (
                    <Check className="w-3 h-3 text-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface CodeDisplayProps {
  isDrawer?: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
  language: string;
  codeContent: string;
  props?: React.ComponentPropsWithoutRef<typeof SyntaxHighlighter>;
  themeStyle: Record<string, React.CSSProperties>;
  lineWrap?: boolean;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  isDrawer = false,
  ref,
  language,
  codeContent,
  props,
  themeStyle,
  lineWrap = false,
}) => {
  const getPadding = () => {
    if (isDrawer) {
      if (window.innerWidth >= 1536) return "3rem";
      if (window.innerWidth >= 1280) return "2.5rem";
      if (window.innerWidth >= 1024) return "2rem";
      return "1.5rem";
    }
    return window.innerWidth < 640 ? "0.75rem" : "1rem";
  };

  const getFontSize = () => {
    if (isDrawer) {
      if (window.innerWidth >= 1536) return "0.95rem";
      if (window.innerWidth >= 1280) return "0.9rem";
      if (window.innerWidth >= 1024) return "0.85rem";
      return "0.8rem";
    }
    return window.innerWidth < 640 ? "0.7rem" : "0.75rem";
  };

  const getLineHeight = () => {
    if (isDrawer) {
      return window.innerWidth >= 1024 ? 1.8 : 1.7;
    }
    return window.innerWidth < 640 ? 1.5 : 1.6;
  };

  return (
    <div
      ref={ref}
      className={cn(isDrawer && "relative code-capture-container")}
    >
      <ScrollArea
        className={cn(
          "rounded-b-2xl border-none",
          isDrawer &&
            "max-h-[70vh] lg:max-h-[75vh] xl:max-h-[80vh] code-scroll-area"
        )}
      >
        <SyntaxHighlighter
          language={language ?? "text"}
          customStyle={{
            margin: 0,
            padding: getPadding(),
            fontSize: getFontSize(),
            lineHeight: getLineHeight(),
            minWidth: "100%",
            width: lineWrap ? "100%" : "max-content",
            backgroundColor: "transparent",
            border: "none",
            // These properties help with image capture and line wrapping
            maxWidth: lineWrap ? "100%" : "none",
            whiteSpace: lineWrap ? "pre-wrap" : "pre",
            wordWrap: lineWrap ? "break-word" : "normal",
            overflow: "visible",
            wordBreak: lineWrap ? "break-word" : "normal",
          }}
          useInlineStyles={true}
          codeTagProps={{
            style: {
              backgroundColor: "transparent",
              fontFamily: "Source Code Pro, monospace",
              whiteSpace: lineWrap ? "pre-wrap" : "pre",
              fontSize: "inherit",
              overflow: "visible",
              maxWidth: lineWrap ? "100%" : "none",
              wordWrap: lineWrap ? "break-word" : "normal",
              wordBreak: lineWrap ? "break-word" : "normal",
            },
          }}
          {...props}
          style={{
            ...themeStyle,
            'code[class*="language-"]': {
              ...themeStyle['code[class*="language-"]'],
              backgroundColor: "transparent",
              background: "transparent",
              overflow: "visible",
              maxWidth: lineWrap ? "100%" : "none",
              whiteSpace: lineWrap ? "pre-wrap" : "pre",
              wordWrap: lineWrap ? "break-word" : "normal",
              wordBreak: lineWrap ? "break-word" : "normal",
            },
            'pre[class*="language-"]': {
              ...themeStyle['pre[class*="language-"]'],
              backgroundColor: "transparent",
              background: "transparent",
              overflow: "visible",
              maxWidth: lineWrap ? "100%" : "none",
              whiteSpace: lineWrap ? "pre-wrap" : "pre",
              wordWrap: lineWrap ? "break-word" : "normal",
              wordBreak: lineWrap ? "break-word" : "normal",
            },
          }}
        >
          {String(codeContent)}
        </SyntaxHighlighter>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CodeRender;
