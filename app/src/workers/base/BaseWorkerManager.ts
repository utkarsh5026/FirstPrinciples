import * as Comlink from "comlink";

/**
 * Configuration options for the BaseWorkerManager
 */
export type WorkerManagerConfig = {
  /** Maximum number of workers to create */
  maxWorkers?: number;

  /** Time in milliseconds after which idle workers are terminated */
  workerTimeout?: number;

  /** Interval in milliseconds to check for and clean up idle workers */
  cleanupInterval?: number;

  /** Whether to automatically terminate all workers when the page unloads */
  terminateOnUnload?: boolean;

  /** Additional options to pass to Worker constructor */
  workerOptions?: WorkerOptions;
};

/**
 * A worker entry in the worker pool
 */
type WorkerEntry<T> = {
  /** The worker instance */
  worker: Worker;

  /** The Comlink-wrapped proxy object for calling worker methods */
  proxy: Comlink.Remote<T>;

  /** Whether the worker is currently processing a task */
  busy: boolean;

  /** Timestamp when the worker was last used */
  lastUsed: number;
};

/**
 * 🧠 Smart Worker Pool Manager
 *
 * This magical class helps you run heavy tasks in the background without freezing your app!
 * It's like having a team of little worker elves that handle all the tough jobs while
 * your main app stays responsive and happy. ✨
 *
 * Features:
 * - 🔄 Automatically creates just the right number of workers for your device
 * - ⚖️ Balances work across all available workers like a fair boss
 * - 🧹 Cleans up idle workers to save memory when they're not needed
 * - 🛡️ Handles errors gracefully so your app doesn't crash
 * - 🔌 Properly shuts everything down when the page closes
 */
export abstract class BaseWorkerManager<T extends object> {
  /** The team of worker elves ready to do your bidding 🧝‍♂️ */
  protected workers: Array<WorkerEntry<T>> = [];

  /** How many workers we're allowed to hire 👷‍♀️ */
  protected maxWorkers: number;

  /** How long workers can chill before being let go ⏱️ */
  protected readonly WORKER_TIMEOUT: number;

  /** ID for our cleanup schedule 🧹 */
  private cleanupTimerId: number | null = null;

  /** Has our worker team been disbanded? 🚫 */
  protected isTerminated = false;

  /**
   * 🏗️ Sets up your worker management system
   *
   * Creates a smart system that adapts to the device it's running on!
   */
  constructor(config: WorkerManagerConfig = {}) {
    // Determine optimal number of workers based on device capabilities
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const maxCores = navigator.hardwareConcurrency || 4;

    this.maxWorkers =
      config.maxWorkers ??
      Math.max(1, Math.floor(maxCores * (isMobile ? 0.5 : 0.75)));

    this.WORKER_TIMEOUT = config.workerTimeout ?? 60000;

    if (config.cleanupInterval !== 0) {
      this.cleanupTimerId = window.setInterval(
        () => this.cleanupIdleWorkers(),
        config.cleanupInterval ?? 30000
      );
    }

    if (config.terminateOnUnload !== false) {
      window.addEventListener("unload", () => this.terminate());
    }
  }

  /**
   * 🏭 Create your specialized worker
   *
   * You'll need to implement this in your subclass to create your specific type of worker!
   */
  protected abstract createWorker(): Worker;

  /**
   * 🎯 Get a worker ready to do a job
   *
   * Finds an available worker or creates a new one if needed. If all workers are busy,
   * it patiently waits for one to become available!
   */
  protected async getWorker(): Promise<{
    proxy: Comlink.Remote<T>;
    release: () => void;
  }> {
    if (this.isTerminated) {
      throw new Error("Worker manager has been terminated");
    }

    // First try to find an available worker
    const availableWorker = this.workers.find((w) => !w.busy);

    if (availableWorker) {
      availableWorker.busy = true;
      availableWorker.lastUsed = Date.now();

      return {
        proxy: availableWorker.proxy,
        release: () => {
          if (!this.isTerminated) {
            availableWorker.busy = false;
            availableWorker.lastUsed = Date.now();
          }
        },
      };
    }

    // Create a new worker if we haven't reached the limit
    if (this.workers.length < this.maxWorkers) {
      try {
        // Create a new worker
        const worker = this.createWorker();

        // Wrap with Comlink
        const proxy = Comlink.wrap<T>(worker);

        const workerEntry: WorkerEntry<T> = {
          worker,
          proxy,
          busy: true,
          lastUsed: Date.now(),
        };

        this.workers.push(workerEntry);

        return {
          proxy,
          release: () => {
            if (!this.isTerminated) {
              workerEntry.busy = false;
              workerEntry.lastUsed = Date.now();
            }
          },
        };
      } catch (error) {
        console.error("Error creating worker:", error);
        throw new Error(
          `Failed to create worker: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    // If all workers are busy and we've reached the limit,
    // wait for a worker to become available
    return new Promise((resolve, reject) => {
      let timeoutId: number | null = null;
      const checkInterval = window.setInterval(() => {
        // Stop checking if the manager has been terminated
        if (this.isTerminated) {
          clearInterval(checkInterval);
          if (timeoutId !== null) clearTimeout(timeoutId);
          reject(new Error("Worker manager has been terminated"));
          return;
        }

        const availableWorker = this.workers.find((w) => !w.busy);

        if (availableWorker) {
          clearInterval(checkInterval);
          if (timeoutId !== null) clearTimeout(timeoutId);

          availableWorker.busy = true;
          availableWorker.lastUsed = Date.now();

          resolve({
            proxy: availableWorker.proxy,
            release: () => {
              if (!this.isTerminated) {
                availableWorker.busy = false;
                availableWorker.lastUsed = Date.now();
              }
            },
          });
        }
      }, 50);

      // Set a timeout of 30 seconds to prevent indefinitely waiting for a worker
      timeoutId = window.setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Timed out waiting for an available worker"));
      }, 30000);
    });
  }

  /**
   * 🧹 Clean up workers on break
   *
   * Checks for workers that have been idle too long and lets them go to save resources.
   * It's like closing unused tabs to save memory!
   */
  protected cleanupIdleWorkers(): void {
    if (this.isTerminated) return;

    const now = Date.now();

    this.workers = this.workers.filter((workerEntry) => {
      // Keep busy workers and recently used workers
      if (
        workerEntry.busy ||
        now - workerEntry.lastUsed < this.WORKER_TIMEOUT
      ) {
        return true;
      }

      // Terminate idle workers
      try {
        // Release Comlink proxies
        workerEntry.proxy[Comlink.releaseProxy]();
        workerEntry.worker.terminate();
      } catch (error) {
        console.error("Error terminating idle worker:", error);
      }

      return false;
    });
  }

  /**
   * 🚀 Run a task with a worker
   *
   * The easiest way to use a worker! Just pass in what you want done,
   * and this handles all the worker management for you.
   */
  protected async executeTask<R>(
    task: (proxy: Comlink.Remote<T>) => Promise<R>
  ): Promise<R> {
    if (this.isTerminated) {
      throw new Error("Worker manager has been terminated");
    }

    const { proxy, release } = await this.getWorker();

    try {
      return await task(proxy);
    } finally {
      release();
    }
  }

  /**
   * 👋 Say goodbye to all workers
   *
   * Properly cleans up all resources when you're done with the worker pool.
   * Always call this when you're finished to prevent memory leaks!
   */
  public terminate(): void {
    if (this.isTerminated) return;

    this.isTerminated = true;

    // Stop the cleanup timer
    if (this.cleanupTimerId !== null) {
      window.clearInterval(this.cleanupTimerId);
      this.cleanupTimerId = null;
    }

    // Terminate all workers
    this.workers.forEach(({ worker, proxy }) => {
      try {
        // Release Comlink proxies
        proxy[Comlink.releaseProxy]();
        worker.terminate();
      } catch (error) {
        console.error("Error terminating worker:", error);
      }
    });

    this.workers = [];
  }

  /**
   * 📊 Check on your worker team
   *
   * See how many workers you have and what they're up to!
   * Great for debugging or showing status in a developer panel.
   */
  public getWorkerStats(): { total: number; busy: number; idle: number } {
    const total = this.workers.length;
    const busy = this.workers.filter((w) => w.busy).length;

    return {
      total,
      busy,
      idle: total - busy,
    };
  }
}
