// src/components/MarkdownDocPage.tsx
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import CustomMarkdownRenderer from "./Renderer";
import { MarkdownLoader } from "@/utils/MarkdownLoader";
import { Document } from "@/components/core/type";

interface MarkdownDocPageProps {
  slug: string;
}

const MarkdownDocPage: React.FC<MarkdownDocPageProps> = ({ slug }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tableOfContents, setTableOfContents] = useState<any[]>([]);

  useEffect(() => {
    const loadDocument = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the document from our static JSON
        const doc = await MarkdownLoader.loadMarkdownFile(`${slug}.md`);

        if (!doc) {
          setError("Document not found");
          setLoading(false);
          return;
        }

        setDocument(doc);

        // Convert document blocks back to markdown for rendering
        const markdown = MarkdownLoader.createMarkdownFromDocument(doc);
        setMarkdownContent(markdown);

        // Extract headings for table of contents
        const headings = extractHeadings(doc);
        setTableOfContents(headings);
      } catch (err) {
        console.error("Failed to load document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [slug]);

  // Extract headings from document for TOC
  const extractHeadings = (doc: Document) => {
    return doc.blocks
      .filter((block) => block.type.startsWith("heading-"))
      .map((block) => {
        const level = parseInt(block.type.split("-")[1]);
        return {
          id: block.id,
          content: block.content,
          level,
          indent: (level - 1) * 16, // 16px per level of indentation
        };
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

  if (error || !document) {
    return (
      <div className="bg-red-900/20 border border-red-800 p-4 rounded-md text-red-200">
        {error || "Failed to load document"}
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
            <div className="sticky top-20 p-4 border border-[#303030] rounded-md bg-[#202020]">
              <h2 className="text-base font-normal mb-3 pb-2 border-b border-[#303030] text-gray-300">
                Contents
              </h2>
              <nav className="space-y-1">
                {tableOfContents.map((item) => {
                  // Simple indentation based on heading level
                  const indentClass =
                    item.level === 1
                      ? "ml-0 font-normal text-gray-300"
                      : item.level === 2
                      ? "ml-3 text-gray-400"
                      : "ml-6 text-gray-500";

                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block py-1 text-sm hover:text-gray-300 transition-colors ${indentClass}`}
                    >
                      {item.content}
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Document content */}
          <div className="col-span-1 md:col-span-3">
            <div className="bg-[#202020] p-6 sm:p-8 rounded-md border border-[#303030]">
              {/* Document header */}
              <div className="mb-8">
                <h1 className="text-3xl font-normal mb-3 text-gray-200 leading-tight">
                  {document.title}
                </h1>
                <div className="text-sm text-gray-500 border-b border-[#303030] pb-3">
                  Created {formatDate(document.createdAt)} · Updated{" "}
                  {formatDate(document.updatedAt)}
                </div>
              </div>

              {/* Markdown content */}
              <CustomMarkdownRenderer markdown={markdownContent} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarkdownDocPage;
