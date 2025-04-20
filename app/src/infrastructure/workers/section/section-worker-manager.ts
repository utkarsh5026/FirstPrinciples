import {
  BaseWorkerManager,
  type WorkerManagerConfig,
} from "@/infrastructure/workers/base/base-worker-manager";
import type { CategoryMetrics } from "@/services/analytics/category-analytics";
import type { CategoryStats } from "@/services/analytics/section-analytics";
import type { SectionReadingData } from "@/services/section/SectionReadingService";

/**
 * API interface for the markdown worker
 * This defines the methods that the worker exposes via Comlink
 */
export interface SectionWorkerAPI {
  getTimeSpentOnDay(
    date: Date,
    readings: SectionReadingData[]
  ): Promise<number>;
  getTotalWordsRead(
    readings: SectionReadingData[],
    wordCountMap?: Record<string, number>
  ): Promise<number>;
  getReadingSpeed(readings: SectionReadingData[]): Promise<number>;
  getDailyReadingStats(
    readings: SectionReadingData[],
    days: number
  ): Promise<{ date: string; timeSpent: number; wordsRead: number }[]>;
  getCategoryStats(
    readings: SectionReadingData[]
  ): Promise<Record<string, CategoryStats>>;
  getCategoryWordsRead(
    readings: SectionReadingData[],
    category?: string
  ): Promise<number>;
  getCategoryTimeSpent(
    readings: SectionReadingData[],
    category?: string
  ): Promise<number>;
  getCategoryMetrics(
    readings: SectionReadingData[],
    category?: string
  ): Promise<CategoryMetrics>;
}

export class SectionWorkerManager extends BaseWorkerManager<SectionWorkerAPI> {
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
    return new Worker(new URL("./section.worker.ts", import.meta.url), {
      type: "module",
    });
  }

  /**
   * 🧩 Turns your markdown into organized sections
   */
  public async getTimeSpentOnDay(
    date: Date,
    readings: SectionReadingData[]
  ): Promise<number> {
    return this.executeTask((proxy) => proxy.getTimeSpentOnDay(date, readings));
  }

  /**
   * 🔢 Counts how many words are in your text
   */
  public async getTotalWordsRead(
    readings: SectionReadingData[],
    wordCountMap?: Record<string, number>
  ): Promise<number> {
    return this.executeTask((proxy) =>
      proxy.getTotalWordsRead(readings, wordCountMap)
    );
  }

  /**
   * ⏱️ Figures out how long it takes to read your content
   */
  public async getReadingSpeed(
    readings: SectionReadingData[]
  ): Promise<number> {
    return this.executeTask((proxy) => proxy.getReadingSpeed(readings));
  }

  /**
   * 📊 Shows your reading stats for the last X days
   */
  public async getDailyReadingStats(
    readings: SectionReadingData[],
    days: number
  ): Promise<{ date: string; timeSpent: number; wordsRead: number }[]> {
    return this.executeTask((proxy) =>
      proxy.getDailyReadingStats(readings, days)
    );
  }

  public async getCategoryStats(
    readings: SectionReadingData[]
  ): Promise<Record<string, CategoryStats>> {
    return this.executeTask((proxy) => proxy.getCategoryStats(readings));
  }

  public async getCategoryWordsRead(
    readings: SectionReadingData[],
    category?: string
  ): Promise<number> {
    return this.executeTask((proxy) =>
      proxy.getCategoryWordsRead(readings, category)
    );
  }

  public async getCategoryTimeSpent(
    readings: SectionReadingData[],
    category?: string
  ): Promise<number> {
    return this.executeTask((proxy) =>
      proxy.getCategoryTimeSpent(readings, category)
    );
  }

  public async getCategoryMetrics(
    readings: SectionReadingData[],
    category?: string
  ): Promise<CategoryMetrics> {
    return this.executeTask((proxy) =>
      proxy.getCategoryMetrics(readings, category)
    );
  }
}
