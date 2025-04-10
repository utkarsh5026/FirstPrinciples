import { useMemo, useCallback } from "react";
import { MarkdownLoader } from "@/utils/MarkdownLoader";

export type MarkdownSection = {
  id: string;
  title: string;
  content: string;
  level: 0 | 1 | 2;
};

/**
 * 📚 useMarkdownProcessor
 *
 * A delightful hook that transforms raw markdown content into beautifully structured sections and table of contents!
 *
 * ✨ This hook makes your markdown content come alive by:
 * - Extracting headings to create a navigable table of contents
 * - Breaking down content into logical sections based on headings
 * - Preserving code blocks and formatting while organizing content
 * - Memoizing results to keep your app snappy and responsive
 *
 * 🧠 It's smart enough to handle various markdown structures, including documents with or without headings,
 * and creates a consistent navigation experience regardless of the input format.
 *
 * 🚀 Perfect for documentation viewers, blog platforms, or any app that needs to display
 * structured markdown content in a user-friendly way!
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

  /**
   * 🔤 Transforms text into URL-friendly slugs
   *
   * Takes headings and converts them into clean IDs for navigation and linking!
   */
  const slugify = useCallback((text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }, []);

  /**
   * 🧩 Breaks down markdown into logical sections
   *
   * This magical function transforms a wall of markdown text into neatly organized
   * sections based on headings, making content more digestible and navigable!
   */
  const parseMarkdownIntoSections = useCallback(
    (markdown: string) => {
      const lines = markdown.split("\n");
      const sections: MarkdownSection[] = [];

      let currentSection: MarkdownSection | null = null;
      let inCodeBlock = false;
      let introContent = "";

      const pushIntroContent = () => {
        if (introContent.trim()) {
          sections.push({
            id: "introduction",
            title: "Introduction",
            content: introContent,
            level: 0,
          });
          introContent = "";
        }
      };

      const initializeSection = (title: string, level: 0 | 1 | 2) => {
        const pounds = "#".repeat(level);
        return {
          id: slugify(title),
          title,
          content: pounds + " " + title + "\n",
          level,
        };
      };

      const handleHeading = (title: string, level: 0 | 1 | 2) => {
        if (currentSection) sections.push(currentSection);
        else if (introContent.trim()) pushIntroContent();
        currentSection = initializeSection(title, level);
      };

      for (const markdownLine of lines) {
        const line = markdownLine.trimEnd();

        if (line.trim().startsWith("```")) {
          inCodeBlock = !inCodeBlock;
          if (currentSection !== null) {
            (currentSection as MarkdownSection).content += line + "\n";
          } else introContent += line + "\n";
          continue;
        }

        if (inCodeBlock) {
          if (currentSection !== null) {
            (currentSection as MarkdownSection).content += line + "\n";
          } else introContent += line + "\n";
          continue;
        }

        const h1Regex = /^#\s+(.+)$/;
        const h2Regex = /^##\s+(.+)$/;
        const h1Match = h1Regex.exec(line);
        const h2Match = h2Regex.exec(line);

        switch (true) {
          case !!h1Match: {
            const title = h1Match[1].trim();
            handleHeading(title, 1);
            break;
          }

          case !!h2Match: {
            const title = h2Match[1].trim();
            handleHeading(title, 2);
            break;
          }

          case currentSection !== null: {
            (currentSection as MarkdownSection).content += line + "\n";
            break;
          }
          default: {
            introContent += line + "\n";
          }
        }
      }

      if (currentSection) sections.push(currentSection);
      else if (introContent.trim())
        sections.push(initializeSection("Content", 0));

      return sections;
    },
    [slugify]
  );

  /**
   * 🌟 Creates beautifully structured content sections!
   *
   * Takes your raw markdown and transforms it into organized, navigable sections
   * that make reading a joy! Perfect for creating immersive reading experiences
   * where users can easily navigate between different parts of your content.
   *
   * ⏱️ Performance is carefully tracked to ensure your app stays lightning fast,
   * even with large documents!
   */
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
