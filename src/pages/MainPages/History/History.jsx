import React from "react";
import HistoryProjects from "../../../components/LandingPage/History/HistoryProjects";
const History = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <HistoryProjects />
      </div>
    </div>
  );
};

export default History;
