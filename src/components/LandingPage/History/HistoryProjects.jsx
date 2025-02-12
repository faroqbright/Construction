import React, { useState, useEffect, useCallback } from "react";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import apiRequest from "../../../utils/apiRequest";
import { useSelector } from "react-redux";
import Skeleton from "@mui/material/Skeleton";
import { useNavigate } from "react-router-dom";

const HistoryProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visibleIndex, setVisibleIndex] = useState(0);
    const navigate = useNavigate();

  const token = useSelector((state) => state?.auth?.userToken);

  const fetchProjects = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await apiRequest(
          "get",
          "/projects",
          { status: "Completed", page },
          token
        );

        if (response?.data?.statusCode === 200) {
          setProjects(response?.data?.data?.projects || []);
          setCurrentPage(response?.data?.data?.currentPage || 1);
          setTotalPages(response?.data?.data?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchProjects(currentPage);
  }, [fetchProjects, currentPage]);

  const handleViewProjectClick = (id) => {
    navigate(`/details/view/${id}`);
  };

  const handleProjectClick = (id) => {
    navigate(`/details/${id}`);
  };

  return (
    <>
      <header className="flex justify-between items-center my-3">
        <h2 className="text-xl md:text-2xl font-semibold text-black-blacknew mx-3">
          Completed Projects
        </h2>
        <div className="flex">
          <button className="p-1 rounded-full">
            <GrFormPrevious className="text-gray-600" size={18} />
          </button>
          <button className="p-1 rounded-full">
            <GrFormNext size={18} />
          </button>
        </div>
      </header>

      <div className="my-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading &&
          Array.from(new Array(6)).map((_, index) => (
            <div
              key={index}
              className="max-w-md h-[24rem] md:h-[21rem] rounded overflow-hidden shadow-lg bg-white p-5 text-[0.7rem]"
            >
              <Skeleton
                variant="rectangular"
                width="100%"
                height={128}
                className="rounded"
              />
              <div className="flex justify-between py-2">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="30%" />
              </div>
              <Skeleton variant="text" width="80%" />
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="text" width="20%" />
                </div>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={8}
                  className="rounded-full"
                />
              </div>
              <div className="mt-4 flex items-center space-x-3">
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="50%" />
              </div>
            </div>
          ))}
        {projects.length === 0 && !loading && <div>No projects available</div>}
        {projects.length > 0 &&
          projects.map((project) => (
            <div
              key={project._id}
              className="max-w-md h-[24rem] md:h-[21rem] rounded overflow-hidden shadow-lg bg-white p-5 text-[0.7rem]"
            >
              <div onClick={() => handleProjectClick(project._id)}>
                <img
                  className="w-full h-40 object-cover rounded"
                  src={
                    project.projectBanner || "https://via.placeholder.com/150"
                  }
                  alt={project.projectName || "Project"}
                />
                <div className="flex justify-between py-2">
                  <div
                    className="font-semibold truncate w-2/4"
                    title={project.projectName}
                  >
                    {project.projectName}
                  </div>
                </div>
                <div className="font-bold">
                  Deadline: <span>{project.deadline}</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700 text-sm">Physical Execution</p>
                    <h6 className="text-gray-800 font-semibold">
                      {project.physicalEducationRange}%
                    </h6>
                  </div>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="absolute top-0 left-0 h-2 rounded-full bg-green-500"
                      style={{ width: `${project.physicalEducationRange}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {project.members
                  .slice(visibleIndex, visibleIndex + 3)
                  .map((member) => (
                    <img
                      key={member._id}
                      className="w-8 h-8 rounded-full"
                      src={member.avatar}
                      alt="Member"
                    />
                  ))}
                <>
                  {project.members.length > 3 && (
                    <div className="flex justify-between text-nowrap">
                      <span className="text-blue-500 underline mx-3 cursor-pointer">
                        +{project.members.length - (visibleIndex + 3)} more
                      </span>
                    </div>
                  )}
                  <h6
                    onClick={() => handleViewProjectClick(project._id)}
                    className="text-blue-500 cursor-pointer underline ml-3"
                  >
                    View Project
                  </h6>
                </>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default HistoryProjects;
