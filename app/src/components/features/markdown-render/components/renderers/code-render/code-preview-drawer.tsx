import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Copy, Check, Image, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ActionButton } from "./action-button";
import ThemeSelector from "./theme-selector";
import CodeSettingsMenu from "./code-settings-menu";
import FontSettingsMenu from "./font-settings-menu";
import CodeDisplay from "./code-display";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCodeSettingsStore } from "@/components/features/markdown-render/store/code-settings-store";

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

/**
 * Code Preview Drawer Component
 *
 * A bottom drawer for better code inspection with download capabilities,
 * theme customization, and comprehensive display settings.
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
  const { settings } = useCodeSettingsStore();

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="h-[85vh] sm:h-[90vh] p-0 font-cascadia-code rounded-t-3xl border-none shadow-2xl shadow-black/20 overflow-hidden">
        <DrawerHeader className="relative px-3 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 border-b border-border/50 bg-gradient-to-r from-card/80 via-card/60 to-card/40 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />

          <div className="relative flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <div className="flex items-center gap-0.5 sm:gap-2 p-1 bg-card/50 rounded-2xl sm:rounded-2xl border border-border/50 backdrop-blur-sm">
                <FontSettingsMenu />

                <div className="w-px h-6 bg-border/50" />

                <ThemeSelector />

                <div className="w-px h-6 bg-border/50" />

                <CodeSettingsMenu />

                {settings.showCopyButton && (
                  <>
                    <div className="w-px h-6 bg-border/50" />
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
                  </>
                )}

                <ActionButton
                  icon={Image}
                  label="Image"
                  loading={downloading === "image"}
                  onClick={onDownloadAsImage}
                  ariaLabel="Download code as image"
                />
                <ActionButton
                  icon={FileText}
                  label="File"
                  loading={downloading === "file"}
                  onClick={onDownloadAsFile}
                  ariaLabel="Download code as file"
                />
              </div>
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 p-3 sm:p-4 lg:p-6 relative overflow-auto">
          <CodeDisplay
            isDrawer
            ref={drawerCodeRef}
            themeStyle={themeStyle}
            language={language}
            codeContent={codeContent}
            props={{ ...props }}
          />
          <ScrollBar orientation="horizontal" className="bg-muted/50" />
          <ScrollBar orientation="vertical" className="bg-muted/50" />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default CodePreviewDrawer;
