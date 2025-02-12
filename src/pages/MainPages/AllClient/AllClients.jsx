import React from "react";
import ClientsTable from "../../../components/LandingPage/AllClients/ClientsTable";

const AllClients = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <ClientsTable />
      </div>
    </div>
  );
};

export default AllClients;
