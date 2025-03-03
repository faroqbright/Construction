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
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Clock, Clock1 } from "lucide-react";
import "../../../utils/i18n";
import { Button } from "@mui/material";
import apiRequest from "../../../utils/apiRequest";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaRecordVinyl } from "react-icons/fa6";

const PendingProjects = () => {
  const [datas, setDatas] = useState([]);
  const [completed, setcompleted] = useState([]);
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const { t } = useTranslation();

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
  
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await apiRequest(
        "get",
        `/documents`,
        {},
        token
      );

      if (response) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [token]);

  const fetchCompletedProjects = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        status: "Completed",
        page: 1,
      }).toString();

      const response = await apiRequest(
        "get",
        `/projects?${params}`,
        {},
        token
      );

      if (response.data && response.data.data.projects) {
        setcompleted(response.data.data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    fetchCompletedProjects();
  }, [fetchCompletedProjects]);


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

  const handleViewProjectClick = (id) => {
    navigate(`/details/${id}`);
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
            <div className="slider-container  ">
              <Slider ref={sliderRefProjects} {...settings}>
                {datas.length > 0 ? (
                  datas?.map((project, index) => (
                    <div
                      key={project._id}
                      className="bg-white rounded-lg justify-between w-full p-4 flex flex-col"
                      style={{ marginLeft: project ? "50px" : "0px" }}
                    >
                      {/* Image */}
                      {project.projectBanner?.length > 0 ? (
                        <Swiper
                          spaceBetween={10}
                          slidesPerView={1}
                          grabCursor={true}
                        >
                          {project.projectBanner.map((banner, index) => (
                            <SwiperSlide key={banner._id || index}>
                              <img
                                className="w-full h-32 object-cover rounded"
                                src={banner.url}
                                alt={`Project Banner ${index + 1}`}
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      ) : (
                        <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-200 rounded">
                          <FaRecordVinyl className="w-8 h-8 text-gray-500" />
                          <p className="text-gray-500 text-sm mt-1">
                            No image yet
                          </p>
                        </div>
                      )}
                      {/* Content */}
                      <div>
                        <div
                          className="cursor-pointer"
                          onClick={() => handleViewProjectClick(project._id)}
                        >
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
                              {project.daysLeft === "Awaiting Start"
                                ? t("Awaiting_Start")
                                : project.daysLeft}
                            </p>
                          </div>

                          {/* Progress Bars */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-black font-medium text-sm">
                                {t("Physical_Execution")}
                              </p>
                              <h6 className="text-gray-800 font-semibold">
                                {
                                  project?.financeDocuments?.[0]
                                    ?.physicalExecution
                                }
                                %
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
                                  width: `${project?.financeDocuments?.[0]?.physicalExecution}%`,
                                }}
                              ></div>
                              <div
                                className="absolute w-5 h-5 rounded-full bg-red-redNew border-2 border-red-redNew"
                                style={{
                                  left: `calc(${project?.financeDocuments?.[0]?.physicalExecution}% - 10px)`,
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
                                {
                                  project?.financeDocuments?.[0]
                                    ?.financialExecution
                                }
                                %
                              </h6>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full relative">
                              {/* Progress Bar - Gray when 0%, Red when >0% */}
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  project?.financeDocuments?.[0]
                                    ?.financialExecution > 0
                                    ? "bg-red-500"
                                    : "bg-gray-300"
                                }`}
                                style={{
                                  width: `${project?.financeDocuments?.[0]?.financialExecution}%`,
                                }}
                              ></div>

                              {/* Indicator Circle - Always Red */}
                              <div
                                className="w-5 h-5 bg-red-500 rounded-full absolute top-1/2 -translate-y-1/2 
      flex items-center justify-center shadow-md cursor-pointer transition-all"
                                style={{
                                  left: `calc(${project?.financeDocuments?.[0]?.financialExecution}% - 10px)`,
                                }}
                              >
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button className="text-[#54577A] underline">
                          {t("deliverables_attached")}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center">{t("No_projects_available")}</p>
                )}
              </Slider>
            </div>
          </div>
        </div>

        <section className="w-full flex justify-between gap-6 mt-14">
  {documents.length > 0 ? (
    <Slider ref={sliderRefProjects} {...settings} className="w-full">
      {documents.map((doc) => (
        <div key={doc._id} className="md:w-[500px] h-[200px] rounded-[10px] bg-white shadow-lg flex justify-center items-center mx-auto">
          <div className="flex flex-col bg-white rounded-[10px] p-4 w-full">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={doc.projectBanner?.[0]?.url || "default-image-url"}
                alt="Project Banner"
                className="w-14 h-14 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-base sm:block">
                  {doc.projName}
                </h3>
                <p className="text-lightpurple-light text-sm whitespace-nowrap sm:block">
                  {doc.fileName}
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
              onClick={() => window.open(doc.fileUrl, "_blank")}
            >
              {t("View_Report")}
            </Button>
          </div>
        </div>
      ))}
    </Slider>
  ) : (
    <p className="text-gray-500 text-center w-full">No documents found.</p>
  )}
</section>


        {/* COmpleted Project */}
        <div className="w-full max-w-7xl mt-10">
          <div className="h-full slider-container">
            <header className="mb-6 flex justify-between">
              <h2 className="text-2xl font-bold text-black">
                {t("Completed_Projects")}
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
                {completed.length > 0 ? (
                  completed?.map((project, index) => (
                    <div
                      key={project._id}
                      className="bg-white rounded-lg shadow-lg p-4 flex flex-col "
                    >
                      {/* Image */}
                      {project.projectBanner?.length > 0 ? (
                        <Swiper
                          spaceBetween={10}
                          slidesPerView={1}
                          grabCursor={true}
                        >
                          {project.projectBanner.map((banner, index) => (
                            <SwiperSlide
                              key={banner._id || index}
                              className="w-[300px]"
                            >
                              <img
                                className="w-full h-32 object-cover rounded"
                                src={banner.url}
                                alt={`Project Banner ${index + 1}`}
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      ) : (
                        <div className=" w-full h-32 flex flex-col items-center justify-center bg-gray-200 rounded">
                          <FaRecordVinyl className="w-8 h-8 text-gray-500" />
                          <p className="text-gray-500 text-sm mt-1">
                            No image yet
                          </p>
                        </div>
                      )}
                      {/* Content */}
                      <div>
                        <div
                          className="cursor-pointer"
                          onClick={() => handleViewProjectClick(project._id)}
                        >
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
                              {project.daysLeft === "Awaiting Start"
                                ? t("Awaiting_Start")
                                : project.daysLeft}
                            </p>
                          </div>

                          {/* Progress Bars */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-black font-medium text-sm">
                                {t("Physical_Execution")}
                              </p>
                              <h6 className="text-gray-800 font-semibold">
                                {
                                  project?.financeDocuments?.[0]
                                    ?.physicalExecution
                                }
                                %
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
                                  width: `${project?.financeDocuments?.[0]?.physicalExecution}%`,
                                }}
                              ></div>
                              <div
                                className="absolute w-5 h-5 rounded-full bg-red-redNew border-2 border-red-redNew"
                                style={{
                                  left: `calc(${project?.financeDocuments?.[0]?.physicalExecution}% - 10px)`,
                                  top: "-6px",
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="mb-4 mt-2 relative">
                            <div className="mb-4 mt-2 relative">
                              <div className="flex justify-between">
                                <p className="black text-sm mb-1">
                                  {t("Financial_Execution")}
                                </p>
                                <h6 className="text-red-redNew">
                                  {
                                    project?.financeDocuments?.[0]
                                      ?.financialExecution
                                  }
                                  %
                                </h6>
                              </div>
                              <div className="w-full bg-gray-200 h-2 rounded-full relative">
                                {/* Progress Bar - Gray when 0%, Red when >0% */}
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    project?.financeDocuments?.[0]
                                      ?.financialExecution > 0
                                      ? "bg-red-500"
                                      : "bg-gray-300"
                                  }`}
                                  style={{
                                    width: `${project?.financeDocuments?.[0]?.financialExecution}%`,
                                  }}
                                ></div>

                                {/* Indicator Circle - Always Red */}
                                <div
                                  className="w-5 h-5 bg-red-500 rounded-full absolute top-1/2 -translate-y-1/2 
      flex items-center justify-center shadow-md cursor-pointer transition-all"
                                  style={{
                                    left: `calc(${project?.financeDocuments?.[0]?.financialExecution}% - 10px)`,
                                  }}
                                >
                                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button className="text-[#54577A] underline">
                          {t("deliverables_attached")}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center">{t("No_projects_available")}</p>
                )}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PendingProjects;
