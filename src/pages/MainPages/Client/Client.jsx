import React from "react";
import ClientEvaluation from "../../../components/LandingPage/Client/ClientEvaluation";

const Client = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <ClientEvaluation />
      </div>
    </div>
  );
};

export default Client;
