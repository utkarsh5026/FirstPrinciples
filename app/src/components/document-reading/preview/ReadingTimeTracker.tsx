import React, { useEffect, useRef, useState } from "react";
import { useReadingHistory } from "@/hooks";
import { toast } from "sonner";
import { formatTimeInMs } from "@/utils/time";

interface SilentReadingTimeIntegrationProps {
  documentPath: string;
  documentTitle: string;
  isFullscreen: boolean;
  onSessionComplete?: (timeSpent: number) => void;
}

/**
 * SilentReadingTimeIntegration Component
 *
 * A non-intrusive reading time tracker that runs in the background without
 * visible UI while the user is reading. When the reading session ends,
 * it shows a toast notification with the time spent.
 *
 * This component prioritizes the reading experience by avoiding
 * any distractions during active reading.
 */
const SilentReadingTimeIntegration: React.FC<
  SilentReadingTimeIntegrationProps
> = ({ documentPath, documentTitle, isFullscreen, onSessionComplete }) => {
  const { updateReadingTime } = useReadingHistory();
  const startTimeRef = useRef<number | null>(null);
  const [sessionEnded, setSessionEnded] = useState<boolean>(false);

  // Start/stop timer based on fullscreen state
  useEffect(() => {
    if (isFullscreen && !startTimeRef.current) {
      // Start the timer
      startTimeRef.current = Date.now();

      console.log("📚 Silent reading session started:", {
        document: documentTitle,
        path: documentPath,
        startTime: new Date().toLocaleTimeString(),
      });
    } else if (!isFullscreen && startTimeRef.current) {
      // End the timer and record session
      endReadingSession();
    }

    return () => {
      // End session if component unmounts while active
      if (isFullscreen && startTimeRef.current && !sessionEnded) {
        endReadingSession();
      }
    };
  }, [isFullscreen, documentPath, documentTitle]);

  // End reading session and record time spent
  const endReadingSession = async () => {
    if (!startTimeRef.current || sessionEnded) return;

    const timeSpent = Date.now() - startTimeRef.current;
    const formattedTime = formatTimeInMs(timeSpent);

    console.log("📚 Reading session ended", {
      document: documentTitle,
      timeSpent: timeSpent,
      formattedTime: formattedTime,
    });

    // Show a toast notification
    toast.success("Reading session completed", {
      description: `You spent ${formattedTime} reading "${documentTitle}"`,
      duration: 4000,
    });

    // Update reading history
    await updateReadingTime(documentPath, documentTitle, timeSpent);

    // Call the optional callback
    if (onSessionComplete) {
      onSessionComplete(timeSpent);
    }

    // Reset state
    setSessionEnded(true);
    startTimeRef.current = null;
  };

  // No visible UI during reading
  return null;
};

export default SilentReadingTimeIntegration;
