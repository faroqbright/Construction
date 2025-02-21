import React, { useEffect, useRef, useState, useCallback } from "react";
import time from "../../../assets/Time Circle.svg";
import student from "../../../assets/Student.svg";
import Notification from "../../../assets/Photo 4.svg";
import student2 from "../../../assets/Photo 2.svg";
import student3 from "../../../assets/Photo 3.svg";
import ongoing from "../../../assets/Image (2).svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-circular-progressbar/dist/styles.css";
import { Button } from "@mui/material";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { Clock, User } from "lucide-react";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const OngoingPro = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [datas, setDatas] = useState([]);
  const sliderRef = useRef(null);
  const { t } = useTranslation();

  const token = useSelector((state) => state.auth.userToken);
  const fetchProjects = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        status: "Ongoing",
        page: 1,
      }).toString();

      const response = await apiRequest(
        "get",
        `/projects?${params}`,
        {},
        token
      );

      if (response.data && response.data.data.projects) {
        setDatas(response.data.data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const navigate = useNavigate();

  const handleViewProjectClick = (id) => {
    navigate(`/details/${id}`);
  };
  return (
    <div className="flex flex-col w-full max-w-4xl space-y-1 items-center overflow-x-auto">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        inline
        calendarClassName="custom-calendar"
        className="w-full hover:rounded-full "
      />
      <div className="w-[400px] pr-6">
        {datas.length > 0 ? (
          datas.slice(0, 1).map((project, index) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-lg shadow-lg w-full mt-6 text-xs md:text-sm relative"
            >
              <div onClick={handleViewProjectClick} className="cursor-pointer">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-black-blacknew">
                    {t("Ongoing")} {t("Projects")}
                  </h2>
                  <h6>...</h6>
                </div>
                <div className="border-b pb-4 mb-4">
                  <img
                    className="w-full h-32 object-cover rounded"
                    src={
                      project.projectBanner || "https://via.placeholder.com/150"
                    }
                    alt={project.projectName || "Project"}
                  />
                  <h3 className="text-lg font-semibold mt-4 text-black-blacknew">
                    {project.projectName}
                  </h3>
                  <p className="text-sm ">
                    <span className="text-black font-bold">
                      {t("Deadline")}
                    </span>
                    {project.deadline}
                  </p>
                  <div className="flex justify-between mt-5">
                    <p className="text-black font-semibold text-sm mb-3">
                      {t("Progress")}
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-black font-medium text-sm">
                        {t("Physical_Execution")}
                      </p>
                      <h6 className="text-gray-800 font-semibold">
                        {project.physicalEducationRange}%
                      </h6>
                    </div>

                    <div className="relative w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`absolute top-0 left-0 h-2 rounded-full bg-red-redNew ${
                          project.status === "Completed"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${project.physicalEducationRange}%`,
                        }}
                      ></div>
                      <div
                        className="absolute w-5 h-5 rounded-full bg-red-redNew border-2 border-red-redNew"
                        style={{
                          left: `calc(${project.physicalEducationRange}% - 10px)`,
                          top: "-6px",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-4 mt-2 relative">
                    <div className="flex justify-between">
                      <p className="black text-sm mb-1">
                        {t("Financial_Execution")}
                      </p>
                      <h6 className="text-red-redNew">
                        {project.physicalEducationRange}%
                      </h6>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full relative">
                      <div
                        className="bg-red-redNew h-2 rounded-full"
                        style={{
                          width: `${project.physicalEducationRange}%`,
                        }}
                      ></div>
                      <div
                        className="w-5 h-5 bg-red-redNew rounded-full absolute top-1/2 -translate-y-1/2 
                 flex items-center justify-center shadow-md cursor-pointer transition-all"
                        style={{
                          left: `calc(${project.physicalEducationRange}% - 10px)`,
                        }}
                      >
                        <span className="w-2 h-2 bg-red-redNew rounded-full"></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 items-center">
                    <div className="flex flex-row items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <p className="text-sm text-black">
                        {project.daysLeft === "Awaiting Start"
                          ? t("Awaiting_Start")
                          : project.daysLeft}
                      </p>
                    </div>

                    <div className="flex absolute right-2">
                      {project.members.map((member) =>
                        member.avatar ? (
                          <img
                            key={member._id}
                            src={member.avatar}
                            alt={member.userName}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <User
                            key={member._id}
                            className="bg-slate-400 rounded-full p-2 text-white mr-2"
                            size={32}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold">
                    {t("Daily_Notifications")}
                  </h4>
                  <h6 className="text-lightpurple">19/12/2024</h6>
                </div>
                <ul className="space-y-2">
                  <li className="text-xs flex gap-2">
                    <img
                      src={Notification}
                      alt="Notification Icon"
                      className="w-8"
                    />
                    Financial execution update required by <br />
                    2024-10-15
                  </li>
                  <li className="text-xs flex gap-2">
                    <img src={student2} alt="Student Icon" className="w-8" />
                    Project approaching deadline, review <br /> pending tasks
                  </li>
                  <li className="text-xs flex gap-2">
                    <img src={student3} alt="Student Icon" className="w-8" />
                    New inspection report submitted for <br />
                    approval
                  </li>
                  <li className="text-xs flex items-center gap-2">
                    <img
                      src={Notification}
                      alt="Notification Icon"
                      className="w-8"
                    />
                    {t("View_Client_Feedback")}
                  </li>
                </ul>
              </div>

              <Button
                sx={{
                  mt: 4,
                  px: 6,
                  backgroundColor: "black",
                  color: "white",
                  borderRadius: "0.5rem",
                  "&:hover": {
                    backgroundColor: "#333",
                  },
                }}
                className="w-full"
              >
                {t("View_Report")}
              </Button>
            </div>
          ))
        ) : (
          <p>{t("No_projects_available")}</p>
        )}
      </div>
    </div>
  );
};

export default OngoingPro;
