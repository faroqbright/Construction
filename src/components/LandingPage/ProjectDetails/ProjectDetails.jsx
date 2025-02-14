import React, { useCallback, useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import pdf from "../../../assets/pdf.svg";
import "react-circular-progressbar/dist/styles.css";
import reviewIcon from "../../../assets/review.svg";
import completedIcon from "../../../assets/completed.svg";
import { FaUser, FaFileAlt, FaCreditCard } from "react-icons/fa";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { useParams } from "react-router-dom";
import { t } from "i18next";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";

const totalTicks = 50;
const ProjectDetails = () => {
  const value = 65;
  const activeTicks = Math.round((value / 100) * totalTicks);
  const { t } = useTranslation();
  const color = "#d6d6d6";
  const token = useSelector((state) => state.auth.userToken);
  const { id } = useParams();
  const [projectData, setProjectData] = useState(null);

  const milestones = [
    { label: t("Project_Details"), icon: <FaUser />, completed: true },
    { label: t("Filing"), icon: <FaFileAlt />, completed: true },
    { label: t("Payment"), icon: <FaCreditCard />, completed: false },
    {
      label: t("Review"),
      icon: <img src={reviewIcon} alt="Review" className="w-4 " />,
      completed: false,
    },
    {
      label: t("Completed"),
      icon: <img src={completedIcon} alt="Completed" className="w-4 " />,
      completed: false,
    },
  ];

  const fetchProjects = useCallback(async () => {
    try {
      const response = await apiRequest("get", `/projects/${id}`, {}, token);
      if (response?.data?.statusCode === 200) {
        setProjectData(response?.data?.data);
      } else {
        setError("Project not found.");
      }
    } catch (error) {
      setError("Error fetching project data");
    }
  }, [id, token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12  font-raleway ">
        <div className="col-span-12">
          <div className="bg-white min-h-screen p-6 mx-2 ">
            <div className="relative">
              <img
                src={
                  projectData?.projectBanner ||
                  "https://via.placeholder.com/150"
                }
                alt={projectData?.projectName || "Project Image"}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute top-4 right-4 text-black font-bold text-xs px-3 py-1 rounded-lg shadow-md">
                {t("Deadline")} {projectData?.deadline}
              </div>
              <button
                variant="contained"
                color="primary"
                className="absolute bottom-4 text-black-blacknew right-4 px-4 py-2 bg-white rounded-md"
              >
                {t("View_Client_Feedback")}
              </button>
            </div>
            <div className="mt-6  p-6 rounded-lg shadow-md">
              <h2 className="font-bold text-gray-800">
                {projectData?.projectName}
              </h2>
              <p className="mt-2 text-lightpurple-light text-sm">
                {projectData?.description}
              </p>
              <div className="flex text-sm text-nowrap w-[20%] gap-4 mt-6 ">
                <div>
                  <strong className="text-black-blacknew">
                    {t("Project_Owner")}
                  </strong>
                  <span className="text-lightpurple-light font-bold text-base">
                    {projectData?.projectOwner}
                  </span>
                </div>
                <div>
                  <strong className="text-black-blacknew">
                    {t("Project_Location")}
                  </strong>{" "}
                  <span className="text-lightpurple-light font-bold text-base">
                    {projectData?.location}
                  </span>
                </div>
                <div>
                  <strong className="text-black-blacknew">
                    {t("Project_Status")}
                  </strong>
                  <span className="text-lightpurple-light font-bold text-base">
                    {projectData?.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 items-start justify-between">
                <div className="mt-14">
                  <h3 className="text-md font-semibold text-gray-800">
                    {t("Project_Deliverables")}:
                  </h3>
                  <div className="flex mt-4 gap-3">
                    {projectData?.lastDelivered && (
                      <div className="flex items-center gap-2 border px-1 rounded-lg transition-all duration-300">
                        <img src={pdf} alt="PDF Icon" className="w-8 h-8" />
                        <div className="mt-1">
                          <span className="text-sm font-semibold">
                            {projectData.lastDelivered
                              .split("/")
                              .pop()
                              .split("_")
                              .slice(1)
                              .join("_")}{" "}
                          </span>
                          <br />
                          <span className="text-xs text-lightpurple-light text-nowrap mt-1">
                            {t("Submitted_By")}:{" "}
                            <span className="text-lightpurple-light">
                              John Doe
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                    {projectData?.older?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 border px-1 rounded-lg transition-all duration-300"
                      >
                        <img src={pdf} alt="PDF Icon" className="w-8 h-8" />
                        <div className="mt-1">
                          <span className="text-sm font-semibold">
                            {item
                              .split("/")
                              .pop()
                              .split("_")
                              .slice(1)
                              .join("_")}{" "}
                          </span>
                          <br />
                          <span className="text-xs text-lightpurple-light text-nowrap mt-1">
                            {t("Submitted_By")}:{" "}
                            <span className="text-lightpurple-light">
                              John Doe
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-8 justify-center">
                  <div className="flex flex-col items-center mt-10">
                    <svg
                      viewBox="0 0 100 55"
                      className="w-40 h-25"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {Array.from({ length: totalTicks }).map((_, index) => {
                        const angle = (360 / (totalTicks - 1)) * index - 65;
                        const isActive = totalTicks - index >= activeTicks;
                        const tickColor = isActive ? color : "#1A1A18";
                        return (
                          <line
                            key={index}
                            x1={50 + 40 * Math.cos((angle * Math.PI) / 180)}
                            y1={50 + 40 * Math.sin((angle * Math.PI) / 180)}
                            x2={50 + 45 * Math.cos((angle * Math.PI) / 180)}
                            y2={50 + 45 * Math.sin((angle * Math.PI) / 180)}
                            stroke={tickColor}
                            strokeWidth="2"
                          />
                        );
                      })}
                      <circle cx="50" cy="38" r="12" fill="#1A1A18" />
                      <text
                        x="50"
                        y="42"
                        textAnchor="middle"
                        fontSize="10"
                        fill="white"
                        fontWeight="bold"
                      >
                        {value}%
                      </text>
                    </svg>
                    <p className="text-center mt-2 text-sm font-medium">
                      {t("Financial_Execution")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-8 justify-center">
                  <div className="flex flex-col items-center mt-10">
                    <svg
                      viewBox="0 0 100 55"
                      className="w-40 h-25"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {Array.from({ length: totalTicks }).map((_, index) => {
                        const angle = (360 / (totalTicks - 1)) * index - 75;
                        const isActive = totalTicks - index >= activeTicks;
                        const tickColor = isActive ? color : "#B91724";
                        return (
                          <line
                            key={index}
                            x1={50 + 40 * Math.cos((angle * Math.PI) / 180)}
                            y1={50 + 40 * Math.sin((angle * Math.PI) / 180)}
                            x2={50 + 45 * Math.cos((angle * Math.PI) / 180)}
                            y2={50 + 45 * Math.sin((angle * Math.PI) / 180)}
                            stroke={tickColor}
                            strokeWidth="2"
                          />
                        );
                      })}
                      <circle cx="50" cy="38" r="12" fill="#B91724" />
                      <text
                        x="50"
                        y="42"
                        textAnchor="middle"
                        fontSize="10"
                        fill="white"
                        fontWeight="bold"
                      >
                        {projectData?.physicalEducationRange}%
                      </text>
                    </svg>
                    <p className="text-center mt-2 text-sm font-medium">
                      {t("Physical_Execution")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("Project_Milestones")}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center justify-between w-full">
                    {milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center space-x-4 relative"
                      >
                        <div
                          className={`h-8 w-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                            milestone.completed
                              ? "border border-red-redNew text-red-redNew"
                              : milestone.label === "Payment"
                              ? "border border-red-redNew text-red-redNew"
                              : "border-2 border-gray-300"
                          }`}
                        >
                          {milestone.icon}
                        </div>
                        {index < milestones.length - 1 && (
                          <div
                            className={`absolute top-1/2 left-full w-[100px] h-0 border-t-2 border-dotted ${
                              milestone.completed
                                ? "border-red-redNew"
                                : milestone.label === "Payment"
                                ? "border-gray-300"
                                : "border-gray-300"
                            }`}
                            style={{
                              transform: "translateY(-50%)",
                            }}
                          />
                        )}
                        <span
                          className={`text-sm font-bold transition-all duration-300 ${
                            milestone.completed
                              ? "text-red-redNew"
                              : milestone.label === "Payment"
                              ? "text-red-redNew"
                              : "text-gray-400"
                          }`}
                        >
                          {milestone.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-black-blacknew">
                  {t("Team_Members")}
                </h3>
                <div className="flex flex-col gap-4 mt-4">
                  {projectData?.members?.map((member, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Avatar
                        src={member.avatar || "https://via.placeholder.com/40"}
                        alt={member.name}
                      />
                      <span className="text-sm text-black-blacknew">
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
