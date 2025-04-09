// src/services/analytics/ReadingSessionTracker.ts

import { databaseService } from "../database/DatabaseService";

export interface ReadingSession {
  id?: number;
  path: string;
  title: string;
  startTime: number;
  endTime: number | null;
  duration: number | null;
  activeTime: number | null; // Excludes idle time
  idleThreshold: number; // Time in ms before considering user idle
  lastActivityTime: number;
  wordCount: number | null; // Word count for the document
  isActive: boolean; // Whether session is currently active
  activityCheckpoints: number[]; // Timestamps of activity for detailed analytics
}

/**
 * Service that tracks precise reading session times,
 * differentiating between active reading and idle time
 */
export class ReadingSessionTracker {
  private currentSession: ReadingSession | null = null;
  private activityInterval: number | null = null;
  private readonly ACTIVITY_CHECK_INTERVAL = 5000; // 5 seconds
  private readonly DEFAULT_IDLE_THRESHOLD = 60000; // 1 minute

  /**
   * Start a new reading session
   * @param path Document path
   * @param title Document title
   * @param wordCount Optional count of words in the document
   * @param idleThreshold Optional custom idle threshold (default: 1 minute)
   */
  public startSession(
    path: string,
    title: string,
    wordCount?: number,
    idleThreshold: number = this.DEFAULT_IDLE_THRESHOLD
  ): void {
    // End any existing session first
    if (this.currentSession) {
      this.endSession();
    }

    const now = Date.now();

    this.currentSession = {
      path,
      title,
      startTime: now,
      endTime: null,
      duration: null,
      activeTime: 0,
      idleThreshold,
      lastActivityTime: now,
      wordCount: wordCount || null,
      isActive: true,
      activityCheckpoints: [now],
    };

    // Set up activity tracking
    this.monitorUserActivity();

    // Start interval to periodically check activity
    this.activityInterval = window.setInterval(() => {
      this.checkActivity();
    }, this.ACTIVITY_CHECK_INTERVAL);

    console.log(`Started reading session for: ${title}`);
  }

  /**
   * End the current reading session and save it
   * @returns The completed session data
   */
  public async endSession(): Promise<ReadingSession | null> {
    if (!this.currentSession) {
      return null;
    }

    // Clean up interval
    if (this.activityInterval !== null) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }

    // Remove event listeners
    this.removeActivityListeners();

    const now = Date.now();

    // Update session data
    this.currentSession.endTime = now;
    this.currentSession.duration = now - this.currentSession.startTime;

    // Calculate total active time (time between checkpoints that are close enough)
    let activeTime = 0;
    for (let i = 1; i < this.currentSession.activityCheckpoints.length; i++) {
      const timeBetweenCheckpoints =
        this.currentSession.activityCheckpoints[i] -
        this.currentSession.activityCheckpoints[i - 1];

      // Only count time if it's less than the idle threshold
      if (timeBetweenCheckpoints < this.currentSession.idleThreshold) {
        activeTime += timeBetweenCheckpoints;
      }
    }
    this.currentSession.activeTime = activeTime;
    this.currentSession.isActive = false;

    // Save the session to IndexedDB
    try {
      await databaseService.add("readingSessions", this.currentSession);
      console.log(`Ended reading session for: ${this.currentSession.title}`);

      const completedSession = { ...this.currentSession };
      this.currentSession = null;
      return completedSession;
    } catch (error) {
      console.error("Error saving reading session:", error);
      return null;
    }
  }

  /**
   * Record user activity (scrolling, clicking, etc.)
   */
  public recordActivity(): void {
    if (!this.currentSession) {
      return;
    }

    const now = Date.now();
    this.currentSession.lastActivityTime = now;
    this.currentSession.activityCheckpoints.push(now);
  }

  /**
   * Check if the user has been idle
   */
  private checkActivity(): void {
    if (!this.currentSession) {
      return;
    }

    const now = Date.now();
    const idleTime = now - this.currentSession.lastActivityTime;

    // If idle time exceeds threshold, consider user inactive
    if (idleTime > this.currentSession.idleThreshold) {
      // Add activity checkpoint to mark the idle period
      this.currentSession.activityCheckpoints.push(now);
      console.log("User inactive, marking idle period");
    }
  }

  /**
   * Set up event listeners to monitor user activity
   */
  private monitorUserActivity(): void {
    // Capture all types of user activity
    window.addEventListener("scroll", this.handleUserActivity);
    window.addEventListener("mousedown", this.handleUserActivity);
    window.addEventListener("keydown", this.handleUserActivity);
    window.addEventListener("mousemove", this.throttledHandleUserActivity);
    window.addEventListener("touchstart", this.handleUserActivity);
    window.addEventListener("touchmove", this.throttledHandleUserActivity);

    // Also capture visibility changes
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  /**
   * Remove all activity event listeners
   */
  private removeActivityListeners(): void {
    window.removeEventListener("scroll", this.handleUserActivity);
    window.removeEventListener("mousedown", this.handleUserActivity);
    window.removeEventListener("keydown", this.handleUserActivity);
    window.removeEventListener("mousemove", this.throttledHandleUserActivity);
    window.removeEventListener("touchstart", this.handleUserActivity);
    window.removeEventListener("touchmove", this.throttledHandleUserActivity);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }

  /**
   * Handle user activity events
   */
  private handleUserActivity = (): void => {
    this.recordActivity();
  };

  /**
   * Throttled version of handleUserActivity for high-frequency events
   */
  private throttledHandleUserActivity = this.throttle(() => {
    this.recordActivity();
  }, 1000); // Throttle to once per second

  /**
   * Handle document visibility changes (tab switching)
   */
  private handleVisibilityChange = (): void => {
    if (document.hidden && this.currentSession) {
      // User switched away from the tab
      this.currentSession.activityCheckpoints.push(Date.now());
    } else if (!document.hidden && this.currentSession) {
      // User returned to the tab
      this.recordActivity();
    }
  };

  /**
   * Utility function to throttle high-frequency events
   */
  private throttle(func: () => void, limit: number): () => void {
    let lastCall = 0;
    return function () {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        func();
      }
    };
  }

  /**
   * Get all reading sessions for a document
   * @param path Document path
   * @returns Promise with array of sessions
   */
  public async getDocumentSessions(path: string): Promise<ReadingSession[]> {
    try {
      return await databaseService.getByIndex<ReadingSession>(
        "readingSessions",
        "path",
        path
      );
    } catch (error) {
      console.error("Error retrieving document sessions:", error);
      return [];
    }
  }

  /**
   * Calculate total time spent reading a document
   * @param path Document path
   * @param useActiveTime Whether to use active time or total time
   * @returns Promise with total milliseconds spent
   */
  public async getTimeSpentOnDocument(
    path: string,
    useActiveTime = true
  ): Promise<number> {
    const sessions = await this.getDocumentSessions(path);

    return sessions.reduce((total, session) => {
      if (useActiveTime && session.activeTime !== null) {
        return total + session.activeTime;
      } else if (session.duration !== null) {
        return total + session.duration;
      }
      return total;
    }, 0);
  }

  /**
   * Get the current active session if any
   * @returns The current session or null
   */
  public getCurrentSession(): ReadingSession | null {
    return this.currentSession;
  }

  /**
   * Get all reading sessions
   * @returns Promise with array of all sessions
   */
  public async getAllSessions(): Promise<ReadingSession[]> {
    try {
      return await databaseService.getAll<ReadingSession>("readingSessions");
    } catch (error) {
      console.error("Error retrieving all sessions:", error);
      return [];
    }
  }
}

// Create and export a singleton instance
export const readingSessionTracker = new ReadingSessionTracker();
