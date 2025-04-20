import { useEffect, useRef, useState } from "react";

interface SwipeGestureOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDoubleTap?: () => void;
  targetRef?: React.RefObject<HTMLElement>;
}

export function useSwipeGesture(options: SwipeGestureOptions = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onDoubleTap,
    targetRef,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const [isListening, setIsListening] = useState(true);

  useEffect(() => {
    const targetElement = targetRef?.current || document;

    const handleTouchStart = (e: TouchEvent) => {
      if (!isListening) return;

      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };

      // Check for double tap
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300; // ms

      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        if (onDoubleTap) {
          e.preventDefault();
          onDoubleTap();
        }
      }

      lastTapRef.current = now;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isListening || !touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;

      const deltaX = endX - touchStartRef.current.x;
      const deltaY = endY - touchStartRef.current.y;

      // Only trigger if swipe is more horizontal than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        }
      }

      touchStartRef.current = null;
    };

    targetElement.addEventListener(
      "touchstart",
      handleTouchStart as EventListener,
      {
        passive: false,
      }
    );
    targetElement.addEventListener(
      "touchend",
      handleTouchEnd as EventListener,
      {
        passive: false,
      }
    );

    return () => {
      targetElement.removeEventListener(
        "touchstart",
        handleTouchStart as EventListener
      );
      targetElement.removeEventListener(
        "touchend",
        handleTouchEnd as EventListener
      );
    };
  }, [
    threshold,
    onSwipeLeft,
    onSwipeRight,
    onDoubleTap,
    isListening,
    targetRef,
  ]);

  return {
    pauseListening: () => setIsListening(false),
    resumeListening: () => setIsListening(true),
    isListening,
  };
}
