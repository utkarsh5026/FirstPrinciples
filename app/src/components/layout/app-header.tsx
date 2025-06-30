import { useState, useEffect } from "react";
import { useTheme } from "@/components/features/theme/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import ThemeSelector from "@/components/features/theme/components/theme-selector";
import { FaGithub } from "react-icons/fa";
import FirstPrinciplesLogo from "./logo";

interface AppHeaderProps {
  toggleSidebar: () => void;
  onNavigateHome: () => void;
  className?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  toggleSidebar,
  onNavigateHome,
  className,
}) => {
  const { currentTheme, setTheme } = useTheme();

  /**
   * State to track scroll position and direction
   *
   * @scrollPos - Stores the current scroll position of the window
   * @isScrollingDown - Boolean flag indicating if the user is scrolling down
   * @isVisible - Controls whether the header is visible or hidden
   */
  const [scrollPos, setScrollPos] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  /**
   * Effect hook to handle scroll events
   *
   * This effect:
   * 1. Tracks the current scroll position
   * 2. Determines scroll direction (up or down)
   * 3. Controls header visibility based on scroll behavior
   * 4. Shows header when scrolling up or near the top of the page
   * 5. Hides header when scrolling down and not at the top
   */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const visible = scrollPos > currentScrollPos || currentScrollPos < 10;

      setIsScrollingDown(scrollPos < currentScrollPos);
      setScrollPos(currentScrollPos);
      setIsVisible(visible);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollPos]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-40 px-4 py-2 flex justify-between items-center",
        "bg-background/80 backdrop-blur-sm border-b border-border/40",
        "transition-all duration-300",
        isVisible ? "top-0" : "-top-14", // Hide header when scrolling down on mobile
        isScrollingDown ? "shadow-md" : "",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 rounded-full"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <FirstPrinciplesLogo onClick={onNavigateHome} />
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:translate-x-0 md:hidden">
        <h1 className="text-sm font-medium text-foreground/80 font-cascadia-code">
          🥇 First Principles
        </h1>
      </div>

      {/* Right side - Theme selector */}
      <div className="flex items-center gap-4 font-cascadia-code">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-transparent rounded-full hover:text-primary hover:border-primary cursor-pointer hover:scale-105 transition-all duration-300"
          onClick={() =>
            window.open(
              "https://github.com/utkarsh5026/FirstPrinciples",
              "_blank"
            )
          }
        >
          <FaGithub className="w-4 h-4" />
          <span className="hidden md:inline">GitHub</span>
        </Button>
        <ThemeSelector
          currentTheme={currentTheme.name}
          onThemeChange={setTheme}
        />
      </div>
    </header>
  );
};

export default AppHeader;
