import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { FiChevronRight, FiHome, FiFile } from "react-icons/fi";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BreadcrumbNavProps {
  filePath: string;
  className?: string;
  onNavigate?: (categoryId: string) => void;
}

interface BreadcrumbItem {
  id: string;
  name: string;
  icon?: string;
}

/**
 * BreadcrumbNav Component
 *
 * A React functional component that displays a breadcrumb navigation UI.
 * It allows users to navigate through a hierarchy of pages or categories.
 * The component dynamically adjusts its display based on the screen size,
 * showing a condensed view on smaller screens.
 *
 * Props:
 * - filePath (string): The path of the current file. This is used to load
 *   the breadcrumbs and file metadata.
 * - className (string): Optional additional class names for styling the component.
 * - onNavigate (function): A callback function that is called when a breadcrumb
 *   link is clicked. It receives the ID of the category or file to navigate to.
 *
 * State:
 * - breadcrumbs (BreadcrumbItem[]): An array of breadcrumb items representing
 *   the navigation path.
 * - fileTitle (string): The title of the current file, derived from its metadata.
 * - loading (boolean): A loading state that indicates whether the breadcrumbs
 *   are being fetched.
 * - condensed (boolean): A state that determines if the breadcrumb view should
 *   be condensed based on the screen size.
 *
 * Refs:
 * - scrollRef (React.RefObject<HTMLDivElement>): A reference to the scrollable
 *   div that contains the breadcrumbs, used to control horizontal scrolling.
 *
 * Effects:
 * - useEffect: Loads the breadcrumbs and file metadata when the component mounts
 *   or when the filePath changes. It also sets up a resize event listener to
 *   adjust the condensed state based on the window width.
 * - useEffect: Automatically scrolls the breadcrumb container to the right
 *   when new breadcrumbs are loaded and loading is complete.
 */
const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  filePath,
  className,
  onNavigate,
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [fileTitle, setFileTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [condensed, setCondensed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * loadBreadcrumbs function
   *
   * An asynchronous function that fetches the breadcrumbs and file metadata
   * based on the provided filePath. It updates the state with the fetched
   * breadcrumbs and file title. It also determines if the view should be
   * condensed based on the number of breadcrumbs and the window width.
   */
  useEffect(() => {
    const loadBreadcrumbs = async () => {
      if (!filePath) return;

      setLoading(true);
      try {
        const crumbs = await MarkdownLoader.getFileBreadcrumbs(filePath);
        setBreadcrumbs(crumbs);
        const fileMetadata = await MarkdownLoader.findFileMetadata(filePath);
        if (fileMetadata) setFileTitle(fileMetadata.title || filePath);
        else setFileTitle(filePath);

        setCondensed(crumbs.length > 2 && window.innerWidth < 640);
      } catch (error) {
        console.error("Error loading breadcrumbs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBreadcrumbs();

    /**
     * handleResize function
     *
     * A function that checks the number of breadcrumbs and updates the
     * condensed state based on the window width. It is called on window resize.
     */
    const handleResize = () => {
      if (breadcrumbs.length > 2) {
        setCondensed(window.innerWidth < 640);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [filePath, breadcrumbs.length]);

  /**
   * useEffect for scrolling
   *
   * This effect scrolls the breadcrumb container to the right when new
   * breadcrumbs are loaded and the loading state is false.
   */
  useEffect(() => {
    if (scrollRef.current && !loading) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [breadcrumbs, loading]);

  if (loading || !filePath) {
    return (
      <div className={cn("flex items-center text-muted-foreground", className)}>
        <div className="animate-pulse h-10 bg-card rounded-lg w-full"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        ref={scrollRef}
        className={cn(
          "py-2.5 px-4 rounded-md bg-card",
          "border border-border shadow-sm",
          "overflow-hidden"
        )}
      >
        <Breadcrumb>
          <BreadcrumbList className="gap-1.5">
            {/* Home link */}
            <BreadcrumbItem>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BreadcrumbLink
                      onClick={() => onNavigate?.("root")}
                      className="hover:text-primary text-muted-foreground p-1"
                    >
                      <FiHome size={16} aria-label="Home" />
                    </BreadcrumbLink>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Go to root</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </BreadcrumbItem>

            <BreadcrumbSeparator>
              <FiChevronRight className="text-muted-foreground/60" />
            </BreadcrumbSeparator>

            {/* Handle condensed view for mobile */}
            {condensed ? (
              /* Show ellipsis and last breadcrumb only */
              <>
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>

                <BreadcrumbSeparator>
                  <FiChevronRight className="text-muted-foreground/60" />
                </BreadcrumbSeparator>

                {breadcrumbs.length > 0 && (
                  <>
                    <BreadcrumbItem>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <BreadcrumbLink
                              onClick={() =>
                                onNavigate?.(
                                  breadcrumbs[breadcrumbs.length - 1].id
                                )
                              }
                              className="hover:text-primary text-muted-foreground flex items-center"
                            >
                              {breadcrumbs[breadcrumbs.length - 1].name}
                            </BreadcrumbLink>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Go to {breadcrumbs[breadcrumbs.length - 1].name}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator>
                      <FiChevronRight className="text-muted-foreground/60" />
                    </BreadcrumbSeparator>
                  </>
                )}
              </>
            ) : (
              /* Show all breadcrumbs */
              breadcrumbs.map((crumb) => {
                return (
                  <React.Fragment key={crumb.id}>
                    <BreadcrumbItem>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <BreadcrumbLink
                              onClick={() => onNavigate?.(crumb.id)}
                              className="hover:text-primary text-muted-foreground flex items-center transition-colors"
                            >
                              <span className="text-sm">{crumb.name}</span>
                            </BreadcrumbLink>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Go to {crumb.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator>
                      <FiChevronRight className="text-muted-foreground/60" />
                    </BreadcrumbSeparator>
                  </React.Fragment>
                );
              })
            )}

            {/* Current file - always visible */}
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm text-primary font-medium px-1.5 py-1 flex items-center">
                <FiFile className="mr-1.5 flex-shrink-0" />
                <span className="truncate">{fileTitle}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default BreadcrumbNav;
