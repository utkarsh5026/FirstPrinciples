import {
  Sankey,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Rectangle,
} from "recharts";
import { COLORS } from "../../utils";
import type { SankeyData, SankeyNode } from "./useSankey";
import useMobile from "@/hooks/useMobile";

interface SankeyChartProps {
  sankeyData: SankeyData;
}

/**
 * 🎉 SankeyChart is a delightful visualization component that brings your data flows to life!
 * It creates a beautiful and interactive Sankey diagram, allowing users to easily understand
 * the relationships and strengths of connections between different categories and subcategories.
 *
 * 📱 It adapts to mobile devices, ensuring a smooth experience whether you're on a phone or a desktop.
 * The colors are thoughtfully chosen to represent different types of nodes, making it visually appealing
 * and easy to interpret.
 *
 * 🛠️ With tooltips that provide insightful information about the data, users can hover over the nodes
 * and links to see detailed read counts and flow strengths. This component is perfect for anyone
 * looking to analyze and present complex data in a user-friendly way!
 */
const SankeyChart: React.FC<SankeyChartProps> = ({ sankeyData }) => {
  const { isMobile } = useMobile();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Sankey
        data={sankeyData}
        node={(nodeProps) => {
          const { x, y, width, height, index } = nodeProps;
          const node = sankeyData.nodes[index];

          let fillColor;
          switch (node.type) {
            case "category":
              fillColor = COLORS[0];
              break;
            case "subcategory":
              fillColor = COLORS[2];
              break;
            default:
              fillColor = COLORS[4];
          }

          return (
            <g>
              <Rectangle
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fillColor}
                fillOpacity={0.8}
                style={{ cursor: "pointer" }}
              />
              <text
                x={node.type === "category" ? x - 5 : x + width + 5}
                y={y + height / 2}
                textAnchor={node.type === "category" ? "end" : "start"}
                dominantBaseline="middle"
                fontSize={isMobile ? 10 : 12}
                fill="#333"
                style={{
                  pointerEvents: "none",
                  fontWeight: node.type === "category" ? "bold" : "normal",
                }}
              >
                {node.name}
              </text>
            </g>
          );
        }}
        link={{ stroke: "#77777730" }}
        nodePadding={isMobile ? 20 : 50}
        nodeWidth={isMobile ? 8 : 15}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <RechartsTooltip
          formatter={(
            value: number,
            _name: string,
            props: {
              payload?: {
                payload?: SankeyNode;
              };
            }
          ) => {
            const nodeData = props.payload;
            if (nodeData?.payload) {
              const node = nodeData.payload;
              return [
                node.readCount ? `${node.readCount} reads` : "",
                node.name,
              ];
            } else {
              return [`${value} connections`, "Flow strength"];
            }
          }}
          contentStyle={{
            backgroundColor: "rgba(22, 22, 22, 0.9)",
            border: "1px solid #333",
            borderRadius: "4px",
          }}
        />
      </Sankey>
    </ResponsiveContainer>
  );
};

export default SankeyChart;
