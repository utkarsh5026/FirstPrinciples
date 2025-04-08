import React from "react";
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Treemap,
} from "recharts";
import type { TreeMapData } from "./useInsights";

interface TreeMapProps {
  data: TreeMapData[];
  isMobile?: boolean;
}

/**
 * An enhanced TreeMap component that displays hierarchical data in nested rectangles.
 *
 * This component improves upon the original TreeMap by:
 * - Adding proper responsive container configuration
 * - Customizing tooltips for better readability
 * - Adding better color management for visualization
 * - Ensuring proper rendering on mobile devices
 *
 * @param data - The hierarchical data to display in the treemap
 * @param isMobile - Boolean indicating if the device is mobile
 */
const EnhancedTreeMap: React.FC<TreeMapProps> = ({
  data,
  isMobile = false,
}) => {
  // Custom colors for different levels of the treemap
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

  // Create a custom content component
  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, rank, name } = props;

    // Don't render if dimensions are too small
    if (width < 30 || height < 20) return null;

    // Calculate font size based on area
    const area = width * height;
    let fontSize = 12;
    if (area < 5000) fontSize = 10;
    if (area < 3000) fontSize = 8;

    const colorIndex = depth < COLORS.length ? depth : depth % COLORS.length;
    const color = COLORS[colorIndex];
    const opacity = Math.max(0.2, (rank || 1) / (root?.children?.length || 1));

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={color}
          fillOpacity={opacity}
          stroke="#fff"
          strokeWidth={1}
          className="transition-opacity duration-200 hover:opacity-80"
        />
        {width > 50 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={fontSize}
            fontWeight={500}
            className="pointer-events-none"
          >
            {name}
          </text>
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <Treemap
        data={data}
        dataKey="value"
        nameKey="name"
        aspectRatio={isMobile ? 1 : 4 / 3}
        stroke="#444"
        animationDuration={500}
        isAnimationActive={true}
        content={<CustomizedContent />}
      >
        <RechartsTooltip
          formatter={(value: number, name: string) => [
            `${value} documents read`,
            name,
          ]}
          contentStyle={{
            backgroundColor: "rgba(22, 22, 22, 0.9)",
            border: "1px solid #333",
            borderRadius: "4px",
            padding: "8px 12px",
            fontSize: isMobile ? "12px" : "14px",
          }}
          wrapperStyle={{ zIndex: 100 }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
};

export default EnhancedTreeMap;
