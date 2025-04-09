import React from "react";
import MilestoneTable from "../../../components/LandingPage/AdditionalMilestone/MilestoneTable";

const Milestones = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <MilestoneTable />
      </div>
    </div>
  );
};

export default Milestones;
