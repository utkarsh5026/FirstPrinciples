import React, { useState, useEffect } from "react";
import { MarkdownLoader, MarkdownFrontmatter } from "@/utils/MarkdownLoader";
import {
  FileText,
  ArrowLeft,
  Eye,
  Search,
  X,
  ChevronRight,
} from "lucide-react";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";

interface MarkdownManagerProps {
  onSelectFile?: (filename: string) => void;
}

const MarkdownManager: React.FC<MarkdownManagerProps> = ({ onSelectFile }) => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewFrontmatter, setPreviewFrontmatter] =
    useState<MarkdownFrontmatter | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredFiles, setFilteredFiles] = useState<string[]>([]);

  // Load available markdown files on component mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        const availableFiles = await MarkdownLoader.getAvailableFiles();
        setFiles(availableFiles);
        setFilteredFiles(availableFiles);
        setError(null);
      } catch (err) {
        console.error("Failed to load markdown files:", err);
        setError("Failed to load available files");
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, []);

  // Handle file preview
  const handlePreviewFile = async (filename: string) => {
    setLoading(true);
    try {
      const result = await MarkdownLoader.loadMarkdownContent(filename);
      if (result) {
        setPreviewFile(filename);
        setPreviewContent(result.content);
        setPreviewFrontmatter(result.frontmatter);
        setError(null);
      } else {
        setError(`Failed to load file: ${filename}`);
      }
    } catch (err) {
      console.error(`Failed to load markdown file: ${filename}`, err);
      setError(`Failed to load file: ${filename}`);
    } finally {
      setLoading(false);
    }
  };

  // Select file (use for navigation)
  const handleSelectFile = (filename: string) => {
    if (onSelectFile) {
      onSelectFile(filename);
    }
  };

  // Return to the file list
  const handleBackToList = () => {
    setPreviewFile(null);
    setPreviewContent("");
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredFiles(files);
      return;
    }

    // Filter files based on search term
    const filtered = files.filter((file) => {
      const fileName = file.toLowerCase();
      return fileName.includes(value.toLowerCase());
    });

    setFilteredFiles(filtered);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredFiles(files);
  };

  // Render loading state
  if (loading && !previewFile) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-10 bg-gray-700/50 rounded w-full"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-700/50 rounded"></div>
              <div className="h-16 bg-gray-700/50 rounded"></div>
              <div className="h-16 bg-gray-700/50 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !previewFile) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-md text-red-200">
          {error}
        </div>
      </div>
    );
  }

  // Render file preview
  if (previewFile) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to files
          </button>

          <button
            onClick={() => handleSelectFile(previewFile)}
            className="flex items-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-4 py-2 rounded-md w-full sm:w-auto justify-center sm:justify-start"
          >
            Open in Viewer
            <ChevronRight size={16} className="ml-2" />
          </button>
        </div>

        {previewFrontmatter && (
          <div className="bg-[#202020] border border-[#303030] rounded-md p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-medium text-white mb-4 break-words">
              {previewFrontmatter.title || previewFile}
            </h1>

            <div className="text-sm text-gray-500 flex flex-wrap gap-4 mb-6">
              {previewFrontmatter.createdAt && (
                <span>
                  Created:{" "}
                  {new Date(previewFrontmatter.createdAt).toLocaleDateString()}
                </span>
              )}
              {previewFrontmatter.updatedAt && (
                <span>
                  Updated:{" "}
                  {new Date(previewFrontmatter.updatedAt).toLocaleDateString()}
                </span>
              )}
              {previewFrontmatter.category && (
                <span>Category: {previewFrontmatter.category}</span>
              )}
              {previewFrontmatter.tags &&
                previewFrontmatter.tags.length > 0 && (
                  <span>Tags: {previewFrontmatter.tags.join(", ")}</span>
                )}
            </div>

            <div className="border-t border-[#303030] pt-6">
              <CustomMarkdownRenderer markdown={previewContent} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render file list (default view)
  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-medium text-white mb-4">
        Markdown Files
      </h1>

      {/* Search Input */}
      <div className="mb-6 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2.5 bg-[#252525] border border-[#303030] rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              title="Clear Search"
            >
              <X size={18} className="text-gray-500 hover:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <div className="bg-[#202020] border border-[#303030] rounded-md p-6 text-center">
          {searchTerm ? (
            <>
              <p className="text-gray-400">No files match your search</p>
              <p className="text-sm text-gray-500 mt-2">
                Try a different search term or clear the search
              </p>
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-[#252525] text-gray-300 rounded-md hover:bg-[#303030]"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-400">No markdown files available</p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure you have a content/index.json file listing available
                markdown files.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filteredFiles.map((filename) => (
            <div
              key={filename}
              className="bg-[#202020] border border-[#303030] rounded-md hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => handleSelectFile(filename)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center p-4">
                <div className="flex items-center flex-1 mb-3 sm:mb-0">
                  <FileText
                    size={20}
                    className="text-primary mr-3 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    {/* Truncate long filenames on mobile */}
                    <h3 className="font-medium text-white truncate">
                      {filename}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date().toLocaleDateString()} • Markdown
                    </p>
                  </div>
                </div>
                <div className="flex sm:justify-end">
                  <button
                    className="text-gray-400 hover:text-white p-2 bg-[#252525] rounded-md w-full sm:w-auto flex justify-center items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewFile(filename);
                    }}
                  >
                    <Eye size={16} className="mr-2" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarkdownManager;
