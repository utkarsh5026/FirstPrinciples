import React from "react";
import ReadingProgress from "./ReadingProgress";
import ReadingTrends from "./ReadingTrends";
import Activity from "./Activity";
import HeatMapView from "../timeline/HeatMapView";
import CategoryCoverageMap from "@/components/visualizations/category-coverage/CategoryCoverage";
import { useReadingHistory } from "@/hooks";
import {
  CategoryDistribution,
  TimeOfTheDayDistribution,
} from "@/components/visualizations";

const AnalyticsOverview: React.FC = () => {
  const { history } = useReadingHistory();

  return (
    <div className="space-y-6">
      {/* Progress Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Summary and stats */}
        <div className="space-y-4 flex flex-col gap-4">
          <ReadingProgress />

          <CategoryCoverageMap history={history} />
        </div>

        <div className="space-y-4 flex flex-col gap-4">
          <HeatMapView
            filteredHistory={history}
            usePrevNextButtons={false}
            compact={true}
          />

          <ReadingTrends />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryDistribution history={history} compact typeOfChart="bar" />
        <TimeOfTheDayDistribution history={history} typeOfChart="bar" />
      </div>

      <Activity />
    </div>
  );
};

export default AnalyticsOverview;
