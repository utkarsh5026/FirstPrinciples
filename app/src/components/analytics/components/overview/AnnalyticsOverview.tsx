import React from "react";
import ReadingProgress from "./ReadingProgress";
import Activity from "./Activity";
import HeatMapView from "../timeline/HeatMapView";
import CategoryCoverageMap from "@/components/shared/visualizations/category-coverage/category-coverage";
import { useReadingHistory } from "@/hooks";
import {
  CategoryDistribution,
  TimeOfTheDayDistribution,
} from "@/components/shared/visualizations";
import ContentRecencyTimeline from "./ContentRecencyTimeLine";

const AnalyticsOverview: React.FC = () => {
  const { history } = useReadingHistory();

  return (
    <div className="space-y-6">
      {/* Progress Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Summary and stats */}
        <div className="space-y-4 flex flex-col gap-4"></div>

        <div className="space-y-4 flex flex-col gap-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReadingProgress />

        <CategoryCoverageMap history={history} />
        <CategoryDistribution history={history} compact typeOfChart="bar" />
        <TimeOfTheDayDistribution history={history} typeOfChart="bar" />
        <HeatMapView
          filteredHistory={history}
          usePrevNextButtons={false}
          compact={true}
        />
        <ContentRecencyTimeline />
      </div>

      <Activity />
    </div>
  );
};

export default AnalyticsOverview;
