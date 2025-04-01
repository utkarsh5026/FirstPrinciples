import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import CustomMarkdownRenderer from "./Renderer";
import TableOfContents from "./TableOfContent";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { FileDown, Share2 } from "lucide-react";

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
  const contentRef = useRef<HTMLDivElement>(null);

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
      } catch (err) {
        console.error("Failed to load markdown:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [filename]);

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
    const downloadFilename = filename.endsWith(".md")
      ? filename
      : `${filename}.md`;

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
        <div className="animate-pulse text-gray-400">Loading document...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 p-4 rounded-md text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-400">
      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar for table of contents */}
          <div className="col-span-1 hidden md:block">
            <div className="sticky top-20 space-y-4">
              <TableOfContents
                markdownContent={markdownContent}
                highlightActive={true}
                maxDepth={3}
              />

              <div className="p-4 border border-[#303030] rounded-md bg-[#202020]">
                <h2 className="text-base font-normal mb-3 pb-2 border-b border-[#303030] text-gray-300">
                  Actions
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md bg-[#252525] hover:bg-[#2a2a2a] text-gray-300"
                  >
                    <FileDown size={16} className="mr-2" />
                    Download Markdown
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md bg-[#252525] hover:bg-[#2a2a2a] text-gray-300"
                  >
                    <Share2 size={16} className="mr-2" />
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {frontmatter.tags && frontmatter.tags.length > 0 && (
                <div className="p-4 border border-[#303030] rounded-md bg-[#202020]">
                  <h2 className="text-base font-normal mb-3 pb-2 border-b border-[#303030] text-gray-300">
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {frontmatter.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-md text-xs bg-[#252525] text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document content */}
          <div className="col-span-1 md:col-span-3">
            <div
              ref={contentRef}
              className="bg-[#202020] p-6 sm:p-8 rounded-md border border-[#303030]"
            >
              {/* Document header */}
              <div className="mb-8">
                <h1 className="text-3xl font-normal mb-3 text-gray-200 leading-tight">
                  {frontmatter.title || "Untitled Document"}
                </h1>
                <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 pb-3 border-b border-[#303030]">
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
                  className="flex-1 flex items-center justify-center px-3 py-2 rounded-md bg-[#252525] text-gray-300 text-sm"
                >
                  <FileDown size={16} className="mr-2" />
                  Download
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center px-3 py-2 rounded-md bg-[#252525] text-gray-300 text-sm"
                >
                  <Share2 size={16} className="mr-2" />
                  {copied ? "Copied!" : "Share"}
                </button>
              </div>

              {/* Markdown content */}
              <CustomMarkdownRenderer markdown={markdownContent} />

              {/* Footer with tags on mobile */}
              {frontmatter.tags && frontmatter.tags.length > 0 && (
                <div className="md:hidden mt-8 pt-4 border-t border-[#303030]">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {frontmatter.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-md text-xs bg-[#252525] text-gray-300"
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
