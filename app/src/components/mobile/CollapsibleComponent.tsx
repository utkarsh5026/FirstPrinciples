import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import useMobile from "@/hooks/device/use-mobile";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CollapsibleMobileChartProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 🎉 CollapsibleMobileChart
 *
 * This delightful component creates a collapsible section that can be expanded or
 * collapsed to show or hide its content! It's perfect for organizing information
 * in a user-friendly way, allowing users to focus on what they want to see.
 *
 * 🌟 The component features a title with an icon, making it visually appealing
 * and easy to understand. When the section is open, users can see the content
 * inside, and when it's closed, it saves space while still providing a clear
 * indication of what’s available.
 *
 * 🔄 The open/close state is managed through a simple hook, allowing for smooth
 * transitions and a delightful user experience.
 *
 * 🐾 Use this component to enhance your UI by providing collapsible sections
 * that keep your layout clean and organized!
 */
const CollapsibleMobileChart: React.FC<CollapsibleMobileChartProps> = ({
  title,
  icon,
  children,
}) => {
  const { isMobile } = useMobile();
  const [openSection, setOpenSection] = useState(false);

  if (isMobile) return children;

  return (
    <Card className="p-3 md:p-4 mb-4 rounded-2xl">
      <Collapsible
        open={openSection}
        onOpenChange={(open) => setOpenSection(open)}
      >
        <CollapsibleTrigger className="w-full flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center">
            {icon}
            {title}
          </h3>
          <ChevronDown
            className={`transition-transform h-4 w-4 text-muted-foreground ${
              openSection ? "transform rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">{children}</CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleMobileChart;
