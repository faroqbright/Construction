import React from "react";
import Document from "../../../components/LandingPage/documents/documents";

const Details = () => {
  return (
    <div className="max-w-full mx-auto">
      <div className="grid grid-cols-12">
        <div className="col-span-12">
          <Document />
        </div>
      </div>
    </div>
  );
};

export default Details;