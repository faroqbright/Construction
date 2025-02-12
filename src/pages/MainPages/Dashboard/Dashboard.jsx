import React from "react";
import PendingProjects from "../../../components/LandingPage/Dashboard/PendingProjects";
import OngoingPro from "../../../components/LandingPage/Dashboard/OngoingPro";

const Dashboard = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full lg:w-2/3">
        <PendingProjects />
      </div>
      <div className="w-full lg:w-1/3">
        <OngoingPro />
      </div>
    </div>
  );
};

export default Dashboard;
