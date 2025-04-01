import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { FileDown, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleMarkdownPageProps {
  filename: string;
}

const SimpleMarkdownPage: React.FC<SimpleMarkdownPageProps> = ({
  filename,
}) => {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [frontmatter, setFrontmatter] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [prevNext, setPrevNext] = useState<{ prev?: string; next?: string }>(
    {}
  );
  const [isDarkMode, setIsDarkMode] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check dark mode
  useEffect(() => {
    const darkModePreference = localStorage.getItem("darkMode");
    const prefersDark =
      darkModePreference === "true" || darkModePreference === null;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    const loadMarkdown = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load markdown content directly
        const result = await MarkdownLoader.loadMarkdownContent(filename);

        if (!result) {
          setError("Document not found");
          setLoading(false);
          return;
        }

        setMarkdownContent(result.content);
        setFrontmatter(result.frontmatter);

        // Try to find prev/next documents based on the current file's location
        await findPrevNextDocuments(filename);
      } catch (err) {
        console.error("Failed to load markdown:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [filename]);

  // Find previous and next documents within the same category
  const findPrevNextDocuments = async (currentPath: string) => {
    try {
      // Get the file's breadcrumbs to determine its category
      const breadcrumbs = await MarkdownLoader.getFileBreadcrumbs(currentPath);

      if (breadcrumbs.length === 0) {
        // It's a root file, try to find prev/next among other root files
        const index = await MarkdownLoader.loadContentIndex();
        const rootFiles = index.files || [];

        if (rootFiles.length <= 1) return;

        const currentIndex = rootFiles.findIndex(
          (file) => file.path === currentPath
        );
        if (currentIndex === -1) return;

        const prev =
          currentIndex > 0 ? rootFiles[currentIndex - 1].path : undefined;
        const next =
          currentIndex < rootFiles.length - 1
            ? rootFiles[currentIndex + 1].path
            : undefined;

        setPrevNext({ prev, next });
        return;
      }

      // It's in a category, so load the category structure and find siblings
      const lastCategoryId = breadcrumbs[breadcrumbs.length - 1].id;
      const allCategories = await MarkdownLoader.getCategories();

      // Find the category that contains this file
      const findCategory = (categories: any[], targetId: string): any => {
        for (const category of categories) {
          if (category.id === targetId) {
            return category;
          }
          if (category.subcategories) {
            const found = findCategory(category.subcategories, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const category = findCategory(allCategories, lastCategoryId);
      if (!category || !category.files || category.files.length <= 1) return;

      // Find the current file's position in its category
      const files = category.files;
      const currentIndex = files.findIndex(
        (file: any) => file.path === currentPath
      );
      if (currentIndex === -1) return;

      const prev = currentIndex > 0 ? files[currentIndex - 1].path : undefined;
      const next =
        currentIndex < files.length - 1
          ? files[currentIndex + 1].path
          : undefined;

      setPrevNext({ prev, next });
    } catch (error) {
      console.error("Error finding prev/next documents:", error);
    }
  };

  const handleDownload = () => {
    // Combine frontmatter and content for download
    const frontmatterYaml = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.join(", ")}]`;
        }
        return `${key}: ${value}`;
      })
      .join("\n");

    const fullMarkdown = `---\n${frontmatterYaml}\n---\n\n${markdownContent}`;

    // Create the filename for download
    const downloadFilename = filename.split("/").pop() || filename;

    MarkdownLoader.downloadMarkdown(downloadFilename, fullMarkdown);
  };

  const handleCopyLink = () => {
    // Get the current URL and add the hash
    const slug = filename.endsWith(".md") ? filename.slice(0, -3) : filename;
    const url = `${window.location.origin}${window.location.pathname}#${slug}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div
          className={cn(
            "animate-pulse",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}
        >
          Loading document...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "p-4 rounded-md",
          isDarkMode
            ? "bg-red-900/20 border border-red-800 text-red-200"
            : "bg-red-50 border border-red-200 text-red-800"
        )}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen text-gray-400",
        isDarkMode ? "bg-[#1a1a1a]" : "bg-white text-gray-700"
      )}
    >
      {/* Main content */}
      <main className="max-w-4xl mx-auto px-0 py-0 sm:px-4">
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar for table of contents */}

          {/* Document content */}
          <div className="col-span-1 md:col-span-3">
            <div
              ref={contentRef}
              className={cn(
                "p-6 sm:p-8 rounded-md border",
                isDarkMode
                  ? "bg-[#202020] border-[#303030]"
                  : "bg-white border-gray-200"
              )}
            >
              {/* Document header */}
              <div className="mb-8">
                <h1
                  className={cn(
                    "text-3xl font-normal mb-3 leading-tight",
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  )}
                >
                  {frontmatter.title || "Untitled Document"}
                </h1>
                <div
                  className={cn(
                    "text-sm flex flex-wrap gap-x-4 pb-3 border-b",
                    isDarkMode
                      ? "text-gray-500 border-[#303030]"
                      : "text-gray-500 border-gray-200"
                  )}
                >
                  {frontmatter.createdAt && (
                    <span>Created {formatDate(frontmatter.createdAt)}</span>
                  )}
                  {frontmatter.updatedAt && (
                    <span>Updated {formatDate(frontmatter.updatedAt)}</span>
                  )}
                  {frontmatter.category && (
                    <span>Category: {frontmatter.category}</span>
                  )}
                </div>
              </div>

              {/* Mobile actions bar */}
              <div className="flex md:hidden space-x-2 mb-6">
                <button
                  onClick={handleDownload}
                  className={cn(
                    "flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm",
                    isDarkMode
                      ? "bg-[#252525] text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  <FileDown size={16} className="mr-2" />
                  Download
                </button>

                <button
                  onClick={handleCopyLink}
                  className={cn(
                    "flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm",
                    isDarkMode
                      ? "bg-[#252525] text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  <Share2 size={16} className="mr-2" />
                  {copied ? "Copied!" : "Share"}
                </button>
              </div>

              {/* Markdown content */}
              <CustomMarkdownRenderer markdown={markdownContent} />

              {/* Navigation between documents */}
              {(prevNext.prev || prevNext.next) && (
                <div
                  className={cn(
                    "mt-8 pt-4 flex border-t",
                    isDarkMode ? "border-[#303030]" : "border-gray-200"
                  )}
                >
                  {prevNext.prev ? (
                    <a
                      href={`#${prevNext.prev.replace(/\.md$/, "")}`}
                      className={cn(
                        "flex items-center px-3 py-2 mr-auto rounded-md text-sm",
                        isDarkMode
                          ? "bg-[#252525] text-gray-300 hover:bg-[#2a2a2a]"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      <ChevronLeft size={16} className="mr-2" />
                      Previous
                    </a>
                  ) : (
                    <div /> // Empty div to maintain space
                  )}

                  {prevNext.next && (
                    <a
                      href={`#${prevNext.next.replace(/\.md$/, "")}`}
                      className={cn(
                        "flex items-center px-3 py-2 ml-auto rounded-md text-sm",
                        isDarkMode
                          ? "bg-[#252525] text-gray-300 hover:bg-[#2a2a2a]"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      Next
                      <ChevronRight size={16} className="ml-2" />
                    </a>
                  )}
                </div>
              )}

              {/* Footer with tags on mobile */}
              {frontmatter.tags && frontmatter.tags.length > 0 && (
                <div
                  className={cn(
                    "md:hidden mt-8 pt-4 border-t",
                    isDarkMode ? "border-[#303030]" : "border-gray-200"
                  )}
                >
                  <h3
                    className={cn(
                      "text-sm font-medium mb-2",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {frontmatter.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs",
                          isDarkMode
                            ? "bg-[#252525] text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleMarkdownPage;
