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
import { Clock, Clock1 } from "lucide-react";
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
import Footer from "../CommonUi/Footer";

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
  const sliderRefProjects = useRef(null);
  const sliderRefReports = useRef(null);

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
      <div className="px-4 py-6 pl-8">
        {/* Header */}

        {/* Pending Projects */}
        <div className="w-full max-w-7xl ">
          <div className="h-full slider-container">
            <header className="mb-6 flex justify-between">
              <h2 className="text-2xl font-bold text-black">
                {t("Pending_Projects")}
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
            <div className="slider-container ">
              <Slider ref={sliderRefProjects} {...settings}>
                {datas.length > 0 ? (
                  datas?.map((project, index) => (
                    <div
                      key={project._id} 
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
                        <div className="flex w-full justify-between space-x-2 items-center mb-2">
                          <h3 className="text-sm flex font-semibold text-black text-nowrap sm:w-auto w-full">
                            {project.projectName}
                          </h3>
                        </div>
                        <p className="text-sm black text-nowrap sm:w-full sm:block w-full">
                          <span className="text-black font-bold ">
                            {t("Deadline")}
                          </span>{" "}
                          {project.deadline}
                        </p>
                        <div className="flex flex-row items-center gap-2 mb-3">
                          <Clock1 className="w-4 h-4" />
                          <p className="text-sm text-black">
                            {project.daysLeft}
                          </p>
                        </div>

                        {/* Progress Bars */}
                        <div className="mb-4 relative">
                          <div className="flex justify-between">
                            <p className="text-black text-sm mb-1">
                              Physical Execution
                            </p>
                            <h6 className="text-red-redNew">
                              {project.physicalEducationRange}%
                            </h6>
                          </div>

                          {/* Progress Bar Container */}
                          <div className="w-full bg-gray-200 h-2 rounded-full relative">
                            {/* Progress Bar */}
                            <div
                              className="bg-red-redNew h-2 rounded-full"
                              style={{
                                width: `${project.physicalEducationRange}%`,
                              }}
                            ></div>

                            {/* Progress Handle (Button) */}
                            <div
                              className="w-5 h-5 bg-red-redNew rounded-full absolute top-1/2 -translate-y-1/2 
                 flex items-center justify-center shadow-md cursor-pointer transition-all"
                              style={{
                                left: `calc(${project.physicalEducationRange}% - 10px)`, // Adjust for centering
                              }}
                            >
                              <span className="w-2 h-2 bg-red-redNew rounded-full"></span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 relative">
                          <div className="flex justify-between">
                            <p className="black text-sm mb-1">
                              Financial Execution
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

                        <button className="text-[#54577A] underline">
                          4 deliverables attached
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center">No pending projects found.</p>
                )}
              </Slider>
            </div>
          </div>

          <section className="flex flex-wrap w-full gap-4 mt-5 overflow-x-auto">
            <div className="bg-black-blacknew w-full md:w-[25%] rounded-lg shadow-md px-2 py-3 flex flex-col items-center">
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

            <div className="flex justify-center w-full md:w-[70%] items-center bg-gray-100">
              <div className="bg-white rounded-lg w-full shadow-md px-2 py-3  ">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Activity</h3>
                  <div className="text-sm text-gray-500 cursor-pointer">
                    This Week
                    <span className="ml-1">▼</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">2 Projects</p>
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

            <section className="w-full flex justify-between gap-6 ">
              <div className=" md:w-[500px] h-[200px] rounded-[10px] bg-white shadow-lg flex justify-center items-center mx-auto">
                <div className="flex flex-col bg-white rounded-[10px] p-4 w-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={report} 
                      alt="Report"
                      className="w-14 h-14 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-base sm:block">
                        Downtown Mall
                      </h3>
                      <p className="text-lightpurple-light text-sm whitespace-nowrap sm:block">
                        Financial Report for September 2024
                      </p>
                    </div>
                  </div>
                  <Button
                    sx={{
                      mt: 2,
                      px: 3,
                      py: 1,
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

              {/* Second Report Card */}
              <div className="md:w-[500px] h-[200px] rounded-[10px] bg-white shadow-lg flex justify-center items-center mx-auto">
                <div className="flex flex-col bg-white rounded-[10px] p-4 w-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={report} 
                      alt="Report"
                      className="w-14 h-14 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-base">Downtown Mall</h3>
                      <p className="text-lightpurple-light text-sm whitespace-nowrap">
                        Financial Report for September 2024
                      </p>
                    </div>
                  </div>
                  <Button
                    sx={{
                      mt: 2,
                      px: 3,
                      py: 1,
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
            </section>
          </section>
        </div>
      </div>
    </>
  );
};

export default PendingProjects;
