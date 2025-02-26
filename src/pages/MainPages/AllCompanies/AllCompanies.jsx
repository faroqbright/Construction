import React from "react";
import CompaniesTables from "../../../components/LandingPage/AllCompanies/CompaniesTables";

const AllClients = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <CompaniesTables />
      </div>
    </div>
  );
};

export default AllClients;