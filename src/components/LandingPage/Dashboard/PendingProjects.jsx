import React, { useEffect, useRef, useState, useCallback } from "react";
import noti from "../../../assets/notif.svg";
import profile from "../../../assets/Profil.svg";
import project from "../../../assets/Image (1).svg";
import report from "../../../assets/Image.svg";
import time from "../../../assets/Time Circle.svg";
import "react-datepicker/dist/react-datepicker.css";
import "react-circular-progressbar/dist/styles.css";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { CircularProgressbar } from "react-circular-progressbar";
import { Button } from "@mui/material";
import apiRequest from "../../../utils/apiRequest";

const PendingProjects = () => {
  const [datas, setDatas] = useState([]);
  const sliderRef = useRef(null);

  const token = useSelector((state) => state.auth.userToken);
  const fetchProjects = useCallback(async () => {
    try {
    
      const params = new URLSearchParams({
        status: "Pending",
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

  const data = [
    { name: "S", value: 1 },
    { name: "M", value: 2 },
    { name: "T", value: 1 },
    { name: "W", value: 3 },
    { name: "T", value: 2 },
    { name: "F", value: 1 },
    { name: "S", value: 2 },
  ];
  // Settings for the carousel (adjust according to your needs)
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
          infinite: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
        },
      },
    ],
  };

  // References for each slider
  const sliderRefProjects = useRef(null);
  const sliderRefReports = useRef(null);

  // Handlers for Previous and Next buttons
  const handlePrevClickProjects = () => {
    if (sliderRefProjects.current) {
      sliderRefProjects.current.slickPrev();
    }
  };

  const handleNextClickProjects = () => {
    if (sliderRefProjects.current) {
      sliderRefProjects.current.slickNext();
    }
  };

  const handlePrevClickReports = () => {
    if (sliderRefReports.current) {
      sliderRefReports.current.slickPrev();
    }
  };

  const handleNextClickReports = () => {
    if (sliderRefReports.current) {
      sliderRefReports.current.slickNext();
    }
  };

  return (
    <>
      <div className="px-4 py-5">
        {/* Header */}

        {/* Pending Projects */}
        <div className="h-full slider-container">
          {/* Header Section */}
          <header className="mb-6 flex justify-between">
            <h2 className="text-2xl font-bold text-gray-600">
              Pending Projects
            </h2>
            <div className="flex">
              <button
                onClick={handlePrevClickProjects}
                className="p-1 rounded-full"
              >
                <GrFormPrevious
                  className="text-gray-600 slick-arrow"
                  size={18}
                />
              </button>
              <button
                onClick={handleNextClickProjects}
                className="p-1 rounded-full"
              >
                <GrFormNext className="slick-arrow" size={18} />
              </button>
            </div>
          </header>

          {/* Slider Section */}
          <div className="slider-container">
            <Slider ref={sliderRefProjects} {...settings}>
              {datas.length > 0 ? (
                datas?.map((project, index) => (
                  <div
                    key={project._id} // Use unique _id from the project
                    className="bg-white rounded-lg shadow-lg p-4 flex flex-col "
                  >
                    {/* Image */}
                    <img
                    className="w-full h-40 object-cover rounded-lg mb-4"
                      src={project.projectBanner}
                      alt={project.projectName}
                    
                    />
                    {/* Content */}
                    <div>
                      <div className="flex justify-between space-x-2 items-center mb-2">
                        <h3 className="text-sm flex font-semibold text-gray-700 text-nowrap">
                          {project.projectName}
                        </h3>
                        <p className="text-sm text-gray-500 text-nowrap">
                          <span className="text-black font-medium">
                            Deadline:
                          </span>{" "}
                          {project.deadline}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        <span>Days Left: </span>
                        {project.daysLeft}
                      </p>
                      {/* Progress Bars */}
                      <div className="mb-3">
                        <div className="flex justify-between">
                          <p className="text-gray-700 text-sm mb-1">
                            Physical Execution
                          </p>
                          <h6 className="text-red-redNew">
                            {project.physicalEducationRange}%
                          </h6>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                          <div
                            className="bg-red-redNew h-2 rounded-full"
                            style={{
                              width: `${project.physicalEducationRange}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      {/* Members */}
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Members:</span>{" "}
                        {project.members
                          .map((member) => member.name)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center">No pending projects found.</p>
              )}
            </Slider>
          </div>
        </div>
        {/* Running Projects & Activity */}

        <section className="flex flex-wrap w-full gap-4 mt-5 ">
          {/* Running Projects */}
          <div className="bg-black-blacknew  w-[35%] rounded-lg shadow-md px-2 py-3 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white whitespace-nowrap">
              Running Projects
            </h3>
            <div className="w-40 h-40 p-5">
              <CircularProgressbar
                value={45}
                text="45%"
                styles={{
                  path: {
                    stroke: `rgba(62, 152, 199, ${45 / 100})`,
                    strokeLinecap: "butt",
                    transition: "stroke-dashoffset 0.5s ease 0s",
                  },
                  text: {
                    fill: "#f88",
                    fontSize: "16px",
                  },
                  trail: {
                    stroke: "red",
                  },
                  background: {
                    fill: "#3e98c7",
                  },
                }}
              />
            </div>
            <p className="text-white">100 Projects</p>
          </div>

          {/* Activity Section */}

          <div className="flex justify-center w-[60%]  items-center bg-gray-100">
            <div className="bg-white rounded-lg w-full shadow-md px-2 py-3  ">
              {/* Activity Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Activity</h3>
                <div className="text-sm text-gray-500 cursor-pointer">
                  This Week
                  <span className="ml-1">▼</span>
                </div>
              </div>

              {/* Projects Count */}
              <p className="text-sm text-gray-600 mb-4">2 Projects</p>

              {/* Line Chart */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Reports */}

        <section className="mt-72 md:mt-7  w-full">
          <header className="mb-6 flex justify-between">
            <h2 className="text-2xl font-bold text-black">Quick Reports</h2>
            <div className="flex md:flex-wrap">
              <button className="p-1 rounded-full">
                <GrFormPrevious
                  onClick={handlePrevClickReports}
                  className="text-gray-600"
                  size={18}
                />
              </button>
              <button className="p-1 rounded-full">
                <GrFormNext onClick={handleNextClickReports} size={18} />
              </button>
            </div>
          </header>

          {/* Slider component here */}
          <Slider
            ref={sliderRefReports}
            {...settings}
            className="flex w-full gap-4 sm:flex-wrap sm:justify-center lg:flex-nowrap"
          >
            {[1, 2].map((item) => (
              <div key={item} className="bg-white rounded-lg flex">
                <div className="flex flex-col bg-white rounded-lg p-3 mx-2 w-full">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={report} // Replace with your actual image path
                      alt="Report"
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-sm">Downtown Mall</h3>
                      <p className="text-lightpurple-light text-[0.7rem] whitespace-nowrap">
                        Financial Report for September 2024
                      </p>
                    </div>
                  </div>
                  <Button
                    sx={{
                      mt: 2,
                      px: 2,
                      backgroundColor: "black",
                      color: "white",
                      borderRadius: "0.5rem",
                      "&:hover": {
                        backgroundColor: "#333",
                      },
                    }}
                  >
                    View Report
                  </Button>
                </div>
              </div>
            ))}
          </Slider>
        </section>
      </div>
    </>
  );
};

export default PendingProjects;
