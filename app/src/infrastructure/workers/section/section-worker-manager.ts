import {
  BaseWorkerManager,
  type WorkerManagerConfig,
} from "@/infrastructure/workers/base/base-worker-manager";
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
}
