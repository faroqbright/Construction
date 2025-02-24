import React from "react";
import Report from "../../../components/LandingPage/Report/submitReport";

const ReportsPage = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <Report />
      </div>
    </div>
  );
};

export default ReportsPage;
