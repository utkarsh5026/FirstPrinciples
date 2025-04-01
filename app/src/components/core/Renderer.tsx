// src/components/core/Renderer.tsx

import React, { useEffect, useState } from "react";
import DocumentViewer from "./DocumentViewer";
import { sampleDocument } from "@/concepts/data";
import { DocumentProcessor } from "@/utils/DocumentProcessor";
import { Menu, X } from "lucide-react";

/**
 * A Notion-like document viewer optimized for focus and readability
 * with reduced contrast for better eye comfort
 */
const NotionApp: React.FC = () => {
  // Process the document to ensure all blocks have IDs
  const [processedDocument, setProcessedDocument] = useState(() =>
    DocumentProcessor.processDocument(sampleDocument)
  );
  // Generate table of contents from the processed document
  const [tableOfContents, setTableOfContents] = useState(() =>
    DocumentProcessor.generateTableOfContents(processedDocument)
  );
  // State for sidebar visibility on mobile
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Apply dark mode on component mount
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-400 font-type-mono">
      {/* Minimal header with reduced contrast */}
      <header className="border-b border-[#303030] sticky top-0 bg-[#1a1a1a] z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl font-normal tracking-tight text-gray-300">
            First Principles
          </h1>
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-300"
            aria-label="Toggle sidebar"
          >
            {sidebarVisible ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Mobile sidebar overlay */}
          {sidebarVisible && (
            <div
              className="fixed inset-0 bg-black/40 z-20 md:hidden"
              onClick={() => setSidebarVisible(false)}
            ></div>
          )}

          {/* Focused sidebar with reduced contrast */}
          <div
            className={`${
              sidebarVisible ? "fixed inset-y-0 left-0 w-64 z-30" : "hidden"
            } md:block md:static md:w-auto md:z-auto col-span-1 bg-[#1a1a1a] md:bg-transparent`}
          >
            <div className="sticky top-20 p-4 border border-[#303030] rounded-md bg-[#202020]">
              <h2 className="text-base font-normal mb-3 pb-2 border-b border-[#303030] text-gray-300">
                Contents
              </h2>
              <nav className="space-y-1">
                {tableOfContents.map((item) => {
                  // Simple indentation with minimal styling and reduced contrast
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
                      onClick={() => setSidebarVisible(false)}
                      className={`block py-1 text-sm hover:text-gray-300 transition-colors ${indentClass}`}
                    >
                      {item.content}
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Document content with reduced contrast */}
          <div className="col-span-1 md:col-span-3">
            <div className="bg-[#202020] p-6 sm:p-8 rounded-md border border-[#303030]">
              <DocumentViewer
                document={processedDocument}
                className="prose-invert"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Minimal footer with reduced contrast */}
      <footer className="border-t border-[#303030] mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">NotionLike Interface</p>
        </div>
      </footer>
    </div>
  );
};

export default NotionApp;
