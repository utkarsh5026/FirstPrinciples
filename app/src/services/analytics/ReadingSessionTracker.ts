import { databaseService } from "@/infrastructure/storage/indexed-db";

export type ReadingSession = {
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
};

/**
 * 📚 Reading Session Tracker
 *
 * This service keeps track of how long users spend reading documents.
 * It's smart enough to know when you're actually reading vs when you've
 * stepped away from your device!
 *
 * ⏱️ Tracks active reading time by monitoring user interactions
 * 🔍 Distinguishes between active reading and idle time
 * 📊 Stores detailed analytics about reading habits
 * 🏆 Helps power reading streaks and achievements
 *
 * The tracker automatically records user activity like scrolling,
 * clicking, and typing to determine when you're actively engaged
 * with the content.
 */
export class ReadingSessionTracker {
  private currentSession: ReadingSession | null = null;
  private activityInterval: number | null = null;
  private readonly ACTIVITY_CHECK_INTERVAL = 5000; // 5 seconds
  private readonly DEFAULT_IDLE_THRESHOLD = 60000; // 1 minute

  /**
   * 🚀 Begins tracking a new reading session
   *
   * Starts monitoring how long the user spends reading a document,
   * tracking their activity to distinguish between active reading
   * and idle time.
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
   * 🏁 Completes the current reading session
   *
   * Finalizes the session, calculates active reading time,
   * and saves all the data to the database for future analysis.
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
   * 👆 Notes that the user is actively engaging with content
   *
   * Called whenever the user interacts with the page to mark
   * them as actively reading.
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
   * 💤 Checks if the user has gone idle
   *
   * Periodically runs to see if the user has stopped interacting
   * with the content for a while.
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
   * 👀 Sets up watchers for user activity
   *
   * Attaches event listeners to detect when the user is
   * scrolling, clicking, typing, or otherwise engaging.
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
   * 🧹 Cleans up all activity listeners
   *
   * Removes the event listeners when a session ends.
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
   * 🖱️ Processes user activity events
   *
   * Called whenever the user interacts with the page.
   */
  private handleUserActivity = (): void => {
    this.recordActivity();
  };

  /**
   * 🐢 Slowed-down version of activity handler
   *
   * Prevents too many events from firing at once for
   * high-frequency actions like mouse movement.
   */
  private throttledHandleUserActivity = this.throttle(() => {
    this.recordActivity();
  }, 1000); // Throttle to once per second

  /**
   * 📱 Handles tab switching
   *
   * Detects when the user switches to a different tab or app,
   * which helps track when they're not actively reading.
   */
  private handleVisibilityChange(): void {
    if (document.hidden && this.currentSession) {
      // User switched away from the tab
      this.currentSession.activityCheckpoints.push(Date.now());
    } else if (!document.hidden && this.currentSession) {
      // User returned to the tab
      this.recordActivity();
    }
  }

  /**
   * 🛠️ Utility to prevent event overload
   *
   * Limits how often a function can be called.
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
   * 📖 Retrieves all reading sessions for a specific document
   *
   * Finds every time the user has read a particular document.
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
   * ⏲️ Calculates total reading time for a document
   *
   * Adds up all the time a user has spent reading a specific document,
   * either counting all time or just active reading time.
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
   * 🔍 Gets the currently active reading session
   *
   * Returns the session that's currently in progress, if any.
   */
  public getCurrentSession(): ReadingSession | null {
    return this.currentSession;
  }

  /**
   * 📊 Retrieves all reading sessions
   *
   * Gets the complete history of reading sessions for analysis.
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

export const readingSessionTracker = new ReadingSessionTracker();
