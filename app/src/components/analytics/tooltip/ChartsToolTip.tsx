import { Tooltip as RechartsTooltip } from "recharts";
import { Formatter } from "recharts/types/component/DefaultTooltipContent";
import { useTheme } from "@/hooks/ui/use-theme";

interface ChartsToolTipProps {
  formatter: Formatter<number, string>;
}

const ChartsToolTip: React.FC<ChartsToolTipProps> = ({ formatter }) => {
  const { currentTheme } = useTheme();
  return (
    <RechartsTooltip
      formatter={formatter}
      contentStyle={{
        backgroundColor: currentTheme.cardBg,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: "4px",
      }}
    />
  );
};

export default ChartsToolTip;
