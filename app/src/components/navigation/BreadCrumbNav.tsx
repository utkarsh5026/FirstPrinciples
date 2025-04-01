// src/components/navigation/BreadcrumbNav.tsx
import React, { useEffect, useState } from "react";
import { ChevronRight, Home } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownLoader } from "@/utils/MarkdownLoader";

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

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  filePath,
  className,
  onNavigate,
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [fileTitle, setFileTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBreadcrumbs = async () => {
      if (!filePath) return;

      setLoading(true);
      try {
        // Get breadcrumbs for the file path
        const crumbs = await MarkdownLoader.getFileBreadcrumbs(filePath);
        setBreadcrumbs(crumbs);

        // Get the file title
        const fileMetadata = await MarkdownLoader.findFileMetadata(filePath);
        if (fileMetadata) {
          setFileTitle(fileMetadata.title || filePath);
        } else {
          setFileTitle(filePath);
        }
      } catch (error) {
        console.error("Error loading breadcrumbs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBreadcrumbs();
  }, [filePath]);

  // Get the appropriate icon component
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;

    // Try to get the icon from lucide-react
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || null;
  };

  if (loading || !filePath) {
    return (
      <div className={cn("flex items-center text-gray-500", className)}>
        <div className="animate-pulse h-4 bg-gray-700 rounded w-40"></div>
      </div>
    );
  }

  return (
    <nav
      className={cn(
        "flex items-center overflow-auto whitespace-nowrap",
        className
      )}
    >
      {/* Home link */}
      <button
        className="flex items-center text-gray-400 hover:text-white rounded p-1 transition-colors"
        onClick={() => onNavigate?.("root")}
        aria-label="Home"
      >
        <Home size={16} />
      </button>

      <ChevronRight size={14} className="mx-1 text-gray-600" />

      {/* Category breadcrumbs */}
      {breadcrumbs.map((crumb, index) => {
        const IconComponent = crumb.icon ? getIconComponent(crumb.icon) : null;

        return (
          <React.Fragment key={crumb.id}>
            <button
              className="flex items-center text-gray-400 hover:text-white rounded p-1 transition-colors"
              onClick={() => onNavigate?.(crumb.id)}
            >
              {IconComponent && <IconComponent size={14} className="mr-1" />}
              <span className="text-sm">{crumb.name}</span>
            </button>

            {index < breadcrumbs.length - 1 && (
              <ChevronRight size={14} className="mx-1 text-gray-600" />
            )}
          </React.Fragment>
        );
      })}

      {/* Add separator before current file */}
      {(breadcrumbs.length > 0 || true) && (
        <ChevronRight size={14} className="mx-1 text-gray-600" />
      )}

      {/* Current file */}
      <span className="text-sm text-primary font-medium">{fileTitle}</span>
    </nav>
  );
};

export default BreadcrumbNav;
