import React from "react";
import ProjectManager from "../../../components/LandingPage/AllProjects/ProjectManager";

const AllProjects = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <ProjectManager />
      </div>
    </div>
  );
};

export default AllProjects;
