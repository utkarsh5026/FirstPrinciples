import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  /**
   * The icon to display when not loading
   */
  icon: LucideIcon;
  /**
   * The text label for the button
   */
  label: string;
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean;
  /**
   * Click handler for the button
   */
  onClick?: () => void;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Button variant
   */
  variant?:
    | "ghost"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "link";
  /**
   * Button size
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * Whether to hide the label on mobile devices
   */
  hideLabelOnMobile?: boolean;
  /**
   * Custom loading spinner size
   */
  spinnerSize?: "sm" | "md" | "lg";
  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}

/**
 * ActionButton - A reusable button component with loading state
 *
 * This component follows the DRY principle by providing a consistent
 * interface for action buttons with loading states, icons, and responsive text.
 */
export const ActionButton = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps & React.ComponentProps<typeof Button>
>(
  (
    {
      icon: Icon,
      label,
      loading = false,
      onClick,
      disabled = false,
      className,
      variant = "ghost",
      size = "sm",
      hideLabelOnMobile = true,
      spinnerSize = "sm",
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const getSpinnerSize = () => {
      switch (spinnerSize) {
        case "sm":
          return "w-3.5 h-3.5 sm:w-4 sm:h-4";
        case "md":
          return "w-4 h-4 sm:w-5 sm:h-5";
        case "lg":
          return "w-5 h-5 sm:w-6 sm:h-6";
        default:
          return "w-3.5 h-3.5 sm:w-4 sm:h-4";
      }
    };

    const getIconSize = () => {
      switch (spinnerSize) {
        case "sm":
          return "w-3.5 h-3.5 sm:w-4 sm:h-4";
        case "md":
          return "w-4 h-4 sm:w-5 sm:h-5";
        case "lg":
          return "w-5 h-5 sm:w-6 sm:h-6";
        default:
          return "w-3.5 h-3.5 sm:w-4 sm:h-4";
      }
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          "gap-1 sm:gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl sm:rounded-2xl cursor-pointer h-8 px-2 sm:px-3",
          className
        )}
        aria-label={ariaLabel || (loading ? `Loading ${label}...` : label)}
        {...props}
      >
        {loading ? (
          <div
            className={cn(
              "border-2 border-primary border-t-transparent rounded-full animate-spin",
              getSpinnerSize()
            )}
          />
        ) : (
          <Icon className={getIconSize()} />
        )}
        <span className={cn(hideLabelOnMobile ? "hidden md:inline" : "inline")}>
          {label}
        </span>
      </Button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
