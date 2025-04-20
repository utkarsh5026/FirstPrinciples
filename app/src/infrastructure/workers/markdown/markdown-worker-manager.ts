import {
  BaseWorkerManager,
  type WorkerManagerConfig,
} from "@/infrastructure/workers/base/base-worker-manager";
import type { MarkdownSection } from "@/services/section/parsing";

/**
 * API interface for the markdown worker
 * This defines the methods that the worker exposes via Comlink
 */
export interface MarkdownWorkerAPI {
  parseMarkdown(markdown: string): Promise<MarkdownSection[]>;
  countWords(text: string): Promise<number>;
  estimateReadingTime(
    wordCount: number,
    readingSpeed?: number
  ): Promise<number>;
  slugify(text: string): Promise<string>;
  processDocument(markdown: string): Promise<{
    sections: MarkdownSection[];
    totalWordCount: number;
    totalReadingTime: number;
    slugs: Record<string, string>;
  }>;
}

/**
 * 📝 Markdown Magic Worker Manager ✨
 *
 * This friendly manager handles all your markdown processing needs in the background!
 * It spins up workers to parse, count, and transform your markdown without freezing
 * your app. Think of it as your personal markdown assistant working behind the scenes.
 *
 * Features:
 * - 🧩 Breaks down markdown into neat sections
 * - 🔢 Counts words so you don't have to
 * - ⏱️ Estimates how long your content takes to read
 * - 🔗 Creates pretty URL-friendly slugs
 * - 📊 Processes entire documents with all the stats you need
 */
export class MarkdownWorkerManager extends BaseWorkerManager<MarkdownWorkerAPI> {
  /**
   * 🏗️ Sets up your markdown processing team
   */
  constructor(config: WorkerManagerConfig = {}) {
    super(config);
  }

  /**
   * 👷‍♀️ Hires a new markdown worker
   */
  protected createWorker(): Worker {
    console.log("Creating worker");
    return new Worker(new URL("./markdown.worker.ts", import.meta.url), {
      type: "module",
    });
  }

  /**
   * 🧩 Turns your markdown into organized sections
   */
  public async parseMarkdown(markdown: string): Promise<MarkdownSection[]> {
    return this.executeTask((proxy) => proxy.parseMarkdown(markdown));
  }

  /**
   * 🔢 Counts how many words are in your text
   */
  public async countWords(text: string): Promise<number> {
    return this.executeTask((proxy) => proxy.countWords(text));
  }

  /**
   * ⏱️ Figures out how long it takes to read your content
   */
  public async estimateReadingTime(
    wordCount: number,
    readingSpeed?: number
  ): Promise<number> {
    return this.executeTask((proxy) =>
      proxy.estimateReadingTime(wordCount, readingSpeed)
    );
  }

  /**
   * 🔗 Creates nice URL-friendly versions of your headings
   */
  public async slugify(text: string): Promise<string> {
    return this.executeTask((proxy) => proxy.slugify(text));
  }

  /**
   * 📊 Does all the markdown processing in one go!
   */
  public async processDocument(markdown: string): Promise<{
    sections: MarkdownSection[];
    totalWordCount: number;
    totalReadingTime: number;
    slugs: Record<string, string>;
  }> {
    return this.executeTask((proxy) => proxy.processDocument(markdown));
  }
}

/**
 * 🚀 Ready-to-use markdown worker manager instance
 * Just import and start processing your markdown!
 */
export const markdownWorkerManager = new MarkdownWorkerManager();
