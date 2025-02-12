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
const OngoingPro = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [datas, setDatas] = useState([]);
  const sliderRef = useRef(null);

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
  return (
    <div className="flex flex-col space-y-6 md:space-y-8 lg:space-y-12 ">
      <div className="flex flex-col items-center">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          inline
          calendarClassName="custom-calendar"
        />
        {/* Ongoing Projects */}

        {datas.length > 0 ? (
          datas.slice(0, 1).map((project, index) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-lg shadow-lg w-full mt-6 text-xs md:text-sm relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black-blacknew">
                  Ongoing Project
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
                <p className="text-sm text-lightpurple-light">
                  <span className="text-black-blacknew font-bold">
                    Deadline:
                  </span>
                  {project.deadline}
                </p>
                <div className="flex justify-between mt-5">
                  <p className="text-black-blacknew text-sm">Progress</p>
                  <h6 className="text-red-redNew">
                    {project.physicalEducationRange}
                  </h6>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-full bg-red-redNew rounded-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
                <div className="flex justify-between mt-3 items-center">
                  <p className="text-sm text-gray-500">
                    <img
                      className="mx-2 inline text-black-blacknew"
                      src={time}
                      alt="Time Icon"
                    />
                    {project.daysLeft}
                  </p>
                  <div className="flex absolute right-2 ">
                    {project.members.map((member) => (
                      <img
                        key={member._id}
                        className="w-8 h-8 rounded-full"
                        src={member.avatar}
                        alt="Member"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold">Daily Notifications</h4>
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
                  Client feedback received, rating: 4.5/5
                </li>
              </ul>

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
                View Report
              </Button>
            </div>
          ))
        ) : (
          <p>No projects available</p>
        )}
      </div>
    </div>
  );
};

export default OngoingPro;
