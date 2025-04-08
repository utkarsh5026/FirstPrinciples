import { useMemo, useCallback } from "react";
import { MarkdownLoader } from "@/utils/MarkdownLoader";

/**
 * Custom hook for parsing and memoizing markdown content
 * This prevents re-parsing the content on every render or view switch
 */
export function useMarkdownProcessor(markdownContent: string) {
  // Memoize table of contents extraction
  const tocItems = useMemo(() => {
    if (!markdownContent) return [];

    console.time("Extract TOC");
    const headings =
      MarkdownLoader.extractHeadingsFromMarkdown(markdownContent);
    const items = headings.map((heading) => ({
      id: heading.id,
      content: heading.text,
      level: heading.level,
      indent: (heading.level - 1) * 16,
    }));
    console.timeEnd("Extract TOC");

    return items;
  }, [markdownContent]); // Only re-compute when content changes

  const slugify = useCallback((text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }, []);

  const parseMarkdownIntoSections = useCallback(
    (markdown: string) => {
      const lines = markdown.split("\n");
      const sections = [];

      let currentSection = null;
      let inCodeBlock = false;
      let introContent = "";

      for (const markdownLine of lines) {
        const line = markdownLine.trimEnd();

        // Check if we're in a code block
        if (line.trim().startsWith("```")) {
          inCodeBlock = !inCodeBlock;
          if (currentSection) {
            currentSection.content += line + "\n";
          } else {
            introContent += line + "\n";
          }
          continue;
        }

        // Skip heading detection inside code blocks
        if (inCodeBlock) {
          if (currentSection) {
            currentSection.content += line + "\n";
          } else {
            introContent += line + "\n";
          }
          continue;
        }

        // Detect headings - more flexible regex patterns
        const h1Match = line.match(/^#\s+(.+)$/);
        const h2Match = line.match(/^##\s+(.+)$/);

        if (h1Match) {
          // H1 heading found
          const title = h1Match[1].trim();

          if (currentSection) {
            sections.push(currentSection);
          } else if (introContent.trim()) {
            sections.push({
              id: "introduction",
              title: "Introduction",
              content: introContent,
              level: 0,
            });
            introContent = "";
          }

          currentSection = {
            id: slugify(title),
            title,
            content: line + "\n",
            level: 1,
          };
        } else if (h2Match) {
          // H2 heading found
          const title = h2Match[1].trim();

          if (currentSection) {
            sections.push(currentSection);
          } else if (introContent.trim()) {
            sections.push({
              id: "introduction",
              title: "Introduction",
              content: introContent,
              level: 0,
            });
            introContent = "";
          }

          currentSection = {
            id: slugify(title),
            title,
            content: line + "\n",
            level: 2,
          };
        } else if (currentSection) {
          // Add content to the current section
          currentSection.content += line + "\n";
        } else {
          // Content before the first heading
          introContent += line + "\n";
        }
      }

      // Add the last section
      if (currentSection) {
        sections.push(currentSection);
      } else if (introContent.trim()) {
        // If there's only content without headings
        sections.push({
          id: "content",
          title: "Content",
          content: introContent,
          level: 0,
        });
      }

      return sections;
    },
    [slugify]
  );

  // Memoize section parsing for card view
  const parsedSections = useMemo(() => {
    if (!markdownContent) return [];

    console.time("Parse Sections");
    const sections = parseMarkdownIntoSections(markdownContent);
    console.timeEnd("Parse Sections");

    return sections;
  }, [markdownContent, parseMarkdownIntoSections]);

  return {
    tocItems,
    parsedSections,
  };
}
