// src/workers/markdown/markdown.worker.ts
import * as Comlink from "comlink";
import { countWords } from "@/services/analytics/estimation";
import { parseMarkdownIntoSections, slugify } from "@/services/section/parsing";
import { type MarkdownSection } from "@/services/section/parsing";
import { wordCountEstimator } from "@/services/analytics/WordCountEstimator";

/**
 * Worker implementation for markdown processing
 *
 * This class contains the actual implementation of markdown processing functions
 * that run in a Web Worker. It's exposed via Comlink to allow the main thread
 * to call these methods as if they were local functions.
 */
class MarkdownWorker {
  /**
   * Parse markdown content into navigable sections
   *
   * @param markdown Raw markdown content to parse
   * @returns Array of parsed markdown sections
   */
  parseMarkdown(markdown: string): MarkdownSection[] {
    return parseMarkdownIntoSections(markdown);
  }

  /**
   * Count words in markdown text, removing markdown formatting
   *
   * @param text Markdown text to analyze
   * @returns Word count
   */
  countWords(text: string): number {
    return countWords(text);
  }

  /**
   * Estimate reading time for text based on word count
   *
   * @param wordCount Number of words
   * @param readingSpeed Optional custom reading speed (words per minute)
   * @returns Estimated reading time in milliseconds
   */
  estimateReadingTime(wordCount: number, readingSpeed?: number): number {
    return wordCountEstimator.estimateReadingTime(wordCount, readingSpeed);
  }

  /**
   * Transform text into URL-friendly slugs
   *
   * @param text Text to slugify
   * @returns URL-friendly slug
   */
  slugify(text: string): string {
    return slugify(text);
  }

  /**
   * Process an entire document and return comprehensive metadata
   *
   * @param markdown Raw markdown content
   * @returns Document metadata including sections, word counts, and estimated reading times
   */
  processDocument(markdown: string): {
    sections: MarkdownSection[];
    totalWordCount: number;
    totalReadingTime: number;
    slugs: Record<string, string>;
  } {
    // Parse the markdown into sections
    const sections = this.parseMarkdown(markdown);

    // Calculate total word count
    const totalWordCount = sections.reduce(
      (sum, section) => sum + section.wordCount,
      0
    );

    // Estimate total reading time
    const totalReadingTime = this.estimateReadingTime(totalWordCount);

    // Create a mapping of section titles to slugs
    const slugs: Record<string, string> = {};
    sections.forEach((section) => {
      slugs[section.title] = section.id;
    });

    return {
      sections,
      totalWordCount,
      totalReadingTime,
      slugs,
    };
  }
}

// Expose the worker API using Comlink
Comlink.expose(new MarkdownWorker());

// Make TypeScript happy with self in workers
export {};
