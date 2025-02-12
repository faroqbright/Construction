import React from "react";
import EditProject from "../../../components/LandingPage/EditProject/EditProject";

const Details = () => {
  return (
    <div className="max-w-full mx-auto">
      <div className="grid grid-cols-12">
        <div className="col-span-12">
          <EditProject />
        </div>
      </div>
    </div>
  );
};

export default Details;