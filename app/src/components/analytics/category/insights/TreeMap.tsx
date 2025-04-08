import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Treemap,
} from "recharts";
import type { TreeMapData } from "./useInsights";

interface TreeMapProps {
  data: TreeMapData[];
}

const TreeMap: React.FC<TreeMapProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey="value"
        nameKey="name"
        stroke="#444"
        fill="#8884d8"
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
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
};

export default TreeMap;
