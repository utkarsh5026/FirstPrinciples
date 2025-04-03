import { useState, useEffect, useCallback, useRef, useMemo } from "react";

interface UseMobileOptions {
  phoneBreakpoint?: number;
  tabletBreakpoint?: number;
  debounceDelay?: number;
  detectTouch?: boolean;
  initialDevice?: string;
}

/**
 * useMobile - A robust React hook for detecting mobile devices
 *
 * This hook determines if the current device is a mobile device (phone or tablet)
 * using multiple detection strategies for improved accuracy across browsers and devices.
 *
 * @param {Object} options - Configuration options
 * @param {number} options.phoneBreakpoint - Max width to consider as a phone (default: 768px)
 * @param {number} options.tabletBreakpoint - Max width to consider as a tablet (default: 1024px)
 * @param {number} options.debounceDelay - Delay for resize debouncing (default: 150ms)
 * @param {boolean} options.detectTouch - Enable detection based on touch capabilities (default: true)
 * @param {string} options.initialDevice - Initial device type for SSR ('desktop', 'tablet', 'phone')
 * @returns {Object} - Device information including isMobile, isPhone, isTablet, etc.
 */
function useMobile(options: UseMobileOptions = {}) {
  const {
    phoneBreakpoint = 768,
    tabletBreakpoint = 1024,
    debounceDelay = 150,
    detectTouch = true,
    initialDevice = "desktop",
  } = options;

  // Default state for SSR
  const initialState = useMemo(
    () => ({
      isMobile: initialDevice !== "desktop",
      isPhone: initialDevice === "phone",
      isTablet: initialDevice === "tablet",
      deviceType: initialDevice,
      hasTouch: false,
      width: null as number | null,
    }),
    [initialDevice]
  );

  const [deviceInfo, setDeviceInfo] = useState(initialState);

  // Refs for handling debounce and dimensions
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // Detect device type based on screen size and capabilities
  const detectDevice = useCallback(() => {
    // Handle server-side rendering gracefully
    if (typeof window === "undefined") {
      return initialState;
    }

    // Get current viewport dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    dimensionsRef.current = { width, height };

    // Touch capability detection - combined approaches for better accuracy
    const touchCapable = Boolean(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );

    // Get device characteristics from media queries
    const hasCoarsePointer =
      window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const hasFinePointer =
      window.matchMedia?.("(pointer: fine)").matches ?? false;
    const prefersMobile = window.matchMedia?.("(hover: none)").matches ?? false;

    // Determine device type primarily based on screen width
    let detectedDeviceType = "desktop";
    let isPhoneDetected = false;
    let isTabletDetected = false;

    // Phone detection
    if (width < phoneBreakpoint) {
      detectedDeviceType = "phone";
      isPhoneDetected = true;
    }
    // Tablet detection
    else if (width < tabletBreakpoint) {
      // Additional checks for tablets vs small desktops
      if (detectTouch && (touchCapable || prefersMobile)) {
        // If it has touch but also a fine pointer, it might be a touchscreen laptop
        if (!hasFinePointer || hasCoarsePointer || height > width) {
          detectedDeviceType = "tablet";
          isTabletDetected = true;
        }
      }
    }

    // Edge cases:
    // 1. Large tablets (iPad Pro, etc.)
    if (
      width >= tabletBreakpoint &&
      touchCapable &&
      hasCoarsePointer &&
      !hasFinePointer
    ) {
      detectedDeviceType = "tablet";
      isTabletDetected = true;
    }

    // 2. Phone in landscape mode
    if (
      width >= phoneBreakpoint &&
      width < tabletBreakpoint &&
      height < phoneBreakpoint &&
      touchCapable &&
      hasCoarsePointer
    ) {
      detectedDeviceType = "phone";
      isPhoneDetected = true;
      isTabletDetected = false;
    }

    // 3. Mobile browsers in "desktop mode" often still have mobile signals
    if (
      width >= tabletBreakpoint &&
      prefersMobile &&
      !hasFinePointer &&
      hasCoarsePointer
    ) {
      detectedDeviceType = "tablet";
      isTabletDetected = true;
    }

    // Prepare the result
    const isMobileDetected = isPhoneDetected || isTabletDetected;

    return {
      isMobile: isMobileDetected,
      isPhone: isPhoneDetected,
      isTablet: isTabletDetected,
      deviceType: detectedDeviceType,
      hasTouch: touchCapable,
      width,
    };
  }, [phoneBreakpoint, tabletBreakpoint, detectTouch, initialState]);

  // Handle resize events with debouncing
  useEffect(() => {
    // Skip for SSR
    if (typeof window === "undefined") return;

    // Initial detection
    setDeviceInfo(detectDevice());

    const handleResize = () => {
      // Skip if dimensions haven't actually changed (some mobile browsers fire resize on scroll)
      if (
        window.innerWidth === dimensionsRef.current.width &&
        window.innerHeight === dimensionsRef.current.height
      ) {
        return;
      }

      // Debounce to prevent excessive updates
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }

      resizeTimerRef.current = setTimeout(() => {
        setDeviceInfo(detectDevice());
      }, debounceDelay);
    };

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    // Mobile-specific events and fixes
    if (detectTouch) {
      // Orientation change event for mobile devices
      window.addEventListener("orientationchange", handleResize);

      // Some mobile browsers need a slight delay to report correct dimensions
      // after orientation changes
      setTimeout(() => {
        handleResize();
      }, 300);
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);

      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, [detectDevice, debounceDelay, detectTouch]);

  return deviceInfo;
}

export default useMobile;
