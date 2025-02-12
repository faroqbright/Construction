import React from "react";
import ProjectDetails from "../../../components/LandingPage/ProjectDetails/ProjectDetails";

const Details = () => {
  return (
    <div className="max-w-full mx-auto">
      <div className="grid grid-cols-12">
        <div className="col-span-12">
          <ProjectDetails />
        </div>
      </div>
    </div>
  );
};

export default Details;