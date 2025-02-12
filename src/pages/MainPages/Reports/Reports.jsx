import React from "react";
import DocumentList from "../../../components/LandingPage/Reports/DocumentList";

const Reports = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <DocumentList />
      </div>
    </div>
  );
};

export default Reports;
