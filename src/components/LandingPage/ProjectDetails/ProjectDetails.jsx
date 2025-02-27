import React, { useCallback, useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import pdf from "../../../assets/pdf.svg";
import "react-circular-progressbar/dist/styles.css";
import reviewIcon from "../../../assets/review.svg";
import completedIcon from "../../../assets/completed.svg";
import { FaUser, FaFileAlt, FaCreditCard } from "react-icons/fa";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { useNavigate, useParams } from "react-router-dom";
import { t } from "i18next";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";

const totalTicks = 50;
const ProjectDetails = () => {
  const value = 65;
  const activeTicks = Math.round((value / 100) * totalTicks);
  const navigate = useNavigate() 
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
      <div className="mx-6 bg-white rounded-xl ">
        <div className="mt-6  p-6 ">
          <h2 className="font-bold text-gray-800 text-2xl">
            {projectData?.projectName}
          </h2>
          <p className="mt-2 text-lightpurple-light text-md">
            {projectData?.description}
          </p>
          <div className="flex text-sm text-nowrap w-[20%] gap-4 mt-6 ">
            <div>
              <strong className="text-black-blacknew text-base">
                {t("Project_Owner")}:
              </strong>
              <span className="text-[#54577A] font-bold text-base">
                {projectData?.projectOwner
                  ? projectData.projectOwner.charAt(0).toUpperCase() +
                    projectData.projectOwner.slice(1)
                  : ""}
              </span>
            </div>
            <div>
              <strong className="text-black-blacknew text-base">
                {t("Project_Location")}:
              </strong>{" "}
              <span className="text-[#54577A] font-bold text-base">
                {projectData?.location}
              </span>
            </div>
            <div>
              <strong className="text-black-blacknew text-base">
                {t("Project_Status")}:
              </strong>
              <span className="text-[#54577A] font-bold text-base">
                {projectData?.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-md font-semibold text-gray-800">
            {t("Project_Deliverables")}:
          </h3>
          <div className="flex gap-3 flex-wrap">
            {projectData?.documents?.map((doc, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border px-1 rounded-lg transition-all duration-300 cursor-pointer"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = doc.fileUrl;
                  link.setAttribute("download", doc.fileUrl.split("/").pop()); // Force download
                  link.setAttribute("target", "_blank"); // Open in a new tab
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <img src={pdf} alt="PDF Icon" className="w-8 h-8" />
                <div className="mt-1">
                  <span className="text-sm font-semibold">{doc.fileName}</span>
                  <br />
                  <span className="text-xs text-lightpurple-light text-nowrap mt-1">
                    {t("Submitted_By")}:{" "}
                    <span className="text-lightpurple-light">{doc.user}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 p-6">
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-black font-medium text-sm">
                {t("Physical_Execution")}
              </p>
              <h6 className="text-gray-800 font-semibold">
                {projectData?.financeDocuments?.[0]?.physicalExecution}%
              </h6>
            </div>

            <div className="relative w-full h-2 bg-gray-200 rounded-full">
              <div
                className={`absolute top-0 left-0 h-2 rounded-full bg-red-redNew ${
                  projectData?.status === "Completed"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
                style={{
                  width: `${projectData?.financeDocuments?.[0]?.physicalExecution}%`,
                }}
              ></div>
              <div
                className="absolute w-5 h-5 rounded-full bg-red-redNew border-2 border-red-redNew"
                style={{
                  left: `calc(${projectData?.financeDocuments?.[0]?.physicalExecution}% - 10px)`,
                  top: "-6px",
                }}
              ></div>
            </div>
          </div>

          <div className="mb-4 mt-2 relative">
            <div className="flex justify-between">
              <p className="black text-sm mb-1">{t("Financial_Execution")}</p>
              <h6 className="text-red-redNew">
                {projectData?.financeDocuments?.[0]?.financialExecution}%
              </h6>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full relative">
              <div
                className="bg-red-redNew h-2 rounded-full"
                style={{
                  width: `${projectData?.financeDocuments?.[0]?.financialExecution}%`,
                }}
              ></div>
              <div
                className="w-5 h-5 bg-red-redNew rounded-full absolute top-1/2 -translate-y-1/2 
                 flex items-center justify-center shadow-md cursor-pointer transition-all"
                style={{
                  left: `calc(${projectData?.financeDocuments?.[0]?.financialExecution}% - 10px)`,
                }}
              >
                <span className="w-2 h-2 bg-red-redNew rounded-full"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Images Container */}
        <div className="">
          <div className="p-6">
            <h3 className="text-md font-semibold text-gray-800">
              {t("Project_Photo")}:
            </h3>

            <div className="flex flex-wrap gap-4 justify-center">
              {projectData?.projectBanner?.map((banner) => (
                <div
                  key={banner._id}
                  className="border-[#B5C0CD] border flex flex-col items-center justify-center rounded-lg w-fit p-2"
                >
                  <img
                    src={banner.url}
                    alt={projectData?.projectName || "Project Image"}
                    className="object-cover rounded-xl w-[310px] h-[284px]"
                  />
                  <div className="flex justify-between w-full p-2">
                    <p>{t("Added_On")}</p>
                    <p>{new Date(banner.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )) || (
                <div className="border-[#B5C0CD] border flex flex-col items-center justify-center rounded-lg w-fit p-2">
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Placeholder Image"
                    className="object-cover rounded-xl w-[310px] h-[284px]"
                  />
                  <div className="flex justify-between w-full p-2">
                    <p>{t("Added_On")}</p>
                    <p>-</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project MileStone */}
        <div className="mt-6 p-6">
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

        {/* Finance Status */}
        <div className="mt-14 flex justify-between w-full p-6">
          <h3 className="text-md font-semibold text-gray-800">
            {t("Additional_Invoice")}:
          </h3>
          <div className="flex ">
            {projectData?.financeDocuments?.map((doc, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border px-1 rounded-lg transition-all duration-300 cursor-pointer"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = doc.fileUrl;
                  link.setAttribute("download", doc.fileUrl.split("/").pop()); // Force download
                  link.setAttribute("target", "_blank"); // Open in a new tab
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <img src={pdf} alt="PDF Icon" className="w-8 h-8" />
                <div className="flex w-fit gap-3 items-center">
                  <div className="mt-1">
                    <span className="text-sm font-semibold">
                      {doc.fileName}
                    </span>
                    <br />
                  </div>

                  <div>
                    <button className="mx-3 my-1 px-3 py-1 bg-gray-100">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Members */}
        <div className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-black-blacknew">
            {t("Client_Members")}
          </h3>
          <div className="flex flex-col gap-4 mt-4">
            {projectData?.members?.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <Avatar
                  src={member.avatar || "https://via.placeholder.com/40"}
                  alt={member.name}
                />
                <span className="text-sm text-black-blacknew">
                  {member?.userName} ({member?.role?.roleName})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div className="mt-6 p-6" >
          <h3 className="text-lg font-semibold text-black-blacknew">
            {t("Team_Members")}
          </h3>
          <div className="flex flex-col gap-4 mt-4">
            {projectData?.projectOwners?.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <Avatar
                  src={member.avatar || "https://via.placeholder.com/40"}
                  alt={member.name}
                />
                <span className="text-sm text-black-blacknew">
                  {member?.ownerName}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-5 pr-6 pb-6">
          <button onClick={() => (navigate(`/details/edit/${projectData?._id}`))} className="px-5 py-2 bg-black-blacknew text-white rounded-md">
            Edit Project
          </button>
          <button className="px-5 py-2 rounded-md bg-gray-100">
            View Change Log
          </button>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
