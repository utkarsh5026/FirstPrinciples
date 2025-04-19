import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for managing animation states and interactions for InsightCard components
 *
 * This hook provides functionality for:
 * - Managing hover states
 * - Handling entrance animations with custom delays
 * - Tracking scroll visibility for triggering animations
 * - Managing interaction states for insights
 *
 * @param delay Initial delay for entrance animations
 * @returns Animation control properties and state handlers
 */
export const useContainerAnimation = (delay = 0) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeInsight, setActiveInsight] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle scroll visibility detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, no need to keep observing
            if (cardRef.current) {
              observer.unobserve(cardRef.current);
            }
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of the card is visible
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Calculate animation states based on visibility
  const animationStates = {
    card: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay: delay,
          ease: "easeOut",
        },
      },
    },
    header: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.4,
          delay: delay + 0.1,
          ease: "easeOut",
        },
      },
    },
    content: {
      hidden: { opacity: 0, scale: 0.98 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.5,
          delay: delay + 0.2,
          ease: "easeOut",
        },
      },
    },
    footer: {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          delay: delay + 0.3,
          ease: "easeOut",
        },
      },
    },
    insight: (index: number) => ({
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          delay: delay + 0.3 + index * 0.1,
          ease: "easeOut",
        },
      },
    }),
  };

  // Handlers for mouse interactions
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveInsight(null);
  };

  // Handler for insight interactions
  const handleInsightHover = (index: number | null) => {
    setActiveInsight(index);
  };

  // Special animations for interactive elements
  const getContentAnimation = () => {
    if (isHovered) {
      return { scale: 1.02, transition: { duration: 0.3 } };
    }
    return { scale: 1, transition: { duration: 0.3 } };
  };

  const getInsightAnimation = (index: number) => {
    if (activeInsight === index) {
      return {
        y: -3,
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 },
      };
    }
    return {};
  };

  return {
    cardRef,
    isVisible,
    isHovered,
    activeInsight,
    animationStates,
    handleMouseEnter,
    handleMouseLeave,
    handleInsightHover,
    getContentAnimation,
    getInsightAnimation,
  };
};

/**
 * Custom hook for creating color themes based on different visual styles
 *
 * @param baseColor Base color to derive theme from
 * @param variant Theme variant (default, emphasis, subtle)
 * @returns Object with color styles for the card
 */
export const useInsightTheme = (baseColor = "primary", variant = "default") => {
  // Define color mappings based on variant
  const colorMap: Record<string, Record<string, string>> = {
    primary: {
      default: "from-primary/5 to-primary/10",
      emphasis: "from-primary/10 to-primary/20",
      subtle: "from-primary/2 to-primary/5",
    },
    blue: {
      default: "from-blue-500/5 to-blue-500/10",
      emphasis: "from-blue-500/10 to-blue-500/20",
      subtle: "from-blue-500/2 to-blue-500/5",
    },
    green: {
      default: "from-green-500/5 to-green-500/10",
      emphasis: "from-green-500/10 to-green-500/20",
      subtle: "from-green-500/2 to-green-500/5",
    },
    purple: {
      default: "from-violet-500/5 to-violet-500/10",
      emphasis: "from-violet-500/10 to-violet-500/20",
      subtle: "from-violet-500/2 to-violet-500/5",
    },
    amber: {
      default: "from-amber-500/5 to-amber-500/10",
      emphasis: "from-amber-500/10 to-amber-500/20",
      subtle: "from-amber-500/2 to-amber-500/5",
    },
    red: {
      default: "from-red-500/5 to-red-500/10",
      emphasis: "from-red-500/10 to-red-500/20",
      subtle: "from-red-500/2 to-red-500/5",
    },
  };

  // Get appropriate text color based on base color
  const iconColorMap: Record<string, string> = {
    primary: "text-primary",
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-violet-500",
    amber: "text-amber-500",
    red: "text-red-500",
  };

  // Return theme object with gradient and icon color
  return {
    gradient: colorMap[baseColor]?.[variant] || colorMap.primary.default,
    iconColor: iconColorMap[baseColor] || "text-primary",
  };
};

export default useContainerAnimation;
