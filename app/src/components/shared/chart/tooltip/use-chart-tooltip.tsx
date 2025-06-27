/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import ChartTooltip, {
  TooltipSectionData,
  TooltipFooterData,
} from "@/components/shared/chart/tooltip/chart-tooltip";

export type ChartTooltipPayload = {
  value?: any;
  name?: string;
  dataKey?: string;
  payload?: any;
  [key: string]: any;
};

/**
 * Options for configuring the chart tooltip
 */
export interface UseChartTooltipOptions<T = any> {
  // Function to get the title from the payload data
  getTitle: (payload: T) => ReactNode;

  // Optional function to get a subtitle
  getSubtitle?: (payload: T) => ReactNode;

  // Icon to show in the title section
  icon?: LucideIcon;

  // Function to get sections to display in the tooltip
  getSections: (payload: T) => TooltipSectionData[];

  // Optional function to get footer data
  getFooter?: (payload: T) => TooltipFooterData | undefined;

  // Additional class name for the tooltip
  className?: string;
}

/**
 * A hook that returns a tooltip renderer function for Recharts
 *
 * This hook simplifies the process of creating consistent tooltips across
 * different chart types by providing a standardized way to transform chart
 * data into tooltip content.
 *
 * @example
 * ```tsx
 * const renderTooltip = useChartTooltip({
 *   icon: Clock,
 *   getTitle: (data) => data.formattedHour,
 *   getSections: (data) => [
 *     { label: 'Documents read:', value: data.count, highlight: true },
 *     { label: 'Percent of total:', value: `${data.percentage}%` }
 *   ],
 *   getFooter: (data) => data.isPeak ? {
 *     message: 'Peak reading hour',
 *     icon: TrendingUp,
 *     className: 'text-green-400'
 *   } : undefined
 * });
 * ```
 */
export function useChartTooltip<T = any>(options: UseChartTooltipOptions<T>) {
  // Return a function that can be used as the content prop for Recharts Tooltip
  return function renderTooltip(props: any) {
    const { active, payload } = props;

    if (!active || !payload?.length) {
      return null;
    }

    // Extract the data from the payload
    const data = payload[0].payload as T;

    // Return the ChartTooltip component with the appropriate props
    return (
      <ChartTooltip
        title={options.getTitle(data)}
        subtitle={options.getSubtitle?.(data)}
        icon={options.icon}
        sections={options.getSections(data)}
        footer={options.getFooter?.(data)}
        className={options.className}
      />
    );
  };
}

export default useChartTooltip;
