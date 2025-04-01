// src/components/MarkdownManager.tsx
import React, { useState, useEffect } from "react";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { FileText, ArrowLeft, Eye } from "lucide-react";
import CustomMarkdownRenderer from "../core/Renderer";

interface MarkdownManagerProps {
  onSelectFile?: (filename: string) => void;
}

const MarkdownManager: React.FC<MarkdownManagerProps> = ({ onSelectFile }) => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewFrontmatter, setPreviewFrontmatter] = useState<any>({});

  // Load available markdown files on component mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        const availableFiles = await MarkdownLoader.getAvailableFiles();
        setFiles(availableFiles);
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

  // Render loading state
  if (loading && !previewFile) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !previewFile) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-md text-red-200">
          {error}
        </div>
      </div>
    );
  }

  // Render file preview
  if (previewFile) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to files
          </button>

          <button
            onClick={() => handleSelectFile(previewFile)}
            className="flex items-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-4 py-2 rounded"
          >
            Open in Viewer
          </button>
        </div>

        <div className="bg-[#202020] border border-[#303030] rounded-md p-6">
          <h1 className="text-2xl font-medium text-white mb-4">
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
            {previewFrontmatter.tags && previewFrontmatter.tags.length > 0 && (
              <span>Tags: {previewFrontmatter.tags.join(", ")}</span>
            )}
          </div>

          <div className="border-t border-[#303030] pt-6">
            <CustomMarkdownRenderer markdown={previewContent} />
          </div>
        </div>
      </div>
    );
  }

  // Render file list (default view)
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-medium text-white mb-6">Markdown Files</h1>

      {files.length === 0 ? (
        <div className="bg-[#202020] border border-[#303030] rounded-md p-6 text-center">
          <p className="text-gray-400">No markdown files available</p>
          <p className="text-sm text-gray-500 mt-2">
            Make sure you have a content/index.json file listing available
            markdown files.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((filename) => (
            <div
              key={filename}
              className="bg-[#202020] border border-[#303030] rounded-md p-4 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => handleSelectFile(filename)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <FileText size={20} className="text-primary mr-3" />
                  <div>
                    <h3 className="font-medium text-white">{filename}</h3>
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-white p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewFile(filename);
                  }}
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarkdownManager;
