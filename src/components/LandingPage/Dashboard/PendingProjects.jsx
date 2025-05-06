import React, { useEffect, useRef, useState, useCallback } from "react";
import noti from "../../../assets/notif.svg";
import profile from "../../../assets/Profil.svg";
import project from "../../../assets/Image (1).svg";
import report from "../../../assets/Image.svg";
import time from "../../../assets/Time Circle.svg";
import "react-datepicker/dist/react-datepicker.css";
import "react-circular-progressbar/dist/styles.css";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import logo from "../../../assets/logo1.png";
import Modal from "@mui/material/Modal";
import pdf from "../../../assets/pdf.svg";
import Box from "@mui/material/Box";
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
import { MdOutlineFileDownload } from "react-icons/md";
import { FaStar } from "react-icons/fa";

const PendingProjects = () => {
  const [datas, setDatas] = useState([]);
  const [completed, setcompleted] = useState([]);
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.userToken);
  const userId = useSelector((state) => state?.auth?.userInfo?._id);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const openReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleReviewTextChange = (event) => {
    setReviewText(event.target.value);
  };

  const handleSubmitReview = async () => {
    console.log("id", selectedProjectId);

    try {
      const payload = {
        projectId: selectedProjectId,
        userId: userId,
        message: reviewText,
        rating: rating,
      };

      const response = await apiRequest("post", "/reviews", payload, token);

      if (response.status === 201) {
        console.log("Review submitted successfully!");
        closeReviewModal();
      } else {
        console.error("Error submitting review:", response.data);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const StarRating = ({ rating, onRatingChange }) => {
    return (
      <div className="flex justify-center gap-2 mt-4 mb-6">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <FaStar
              key={index}
              color={starValue <= rating ? "#ffc107" : "#e4e5e9"}
              onClick={() => onRatingChange(starValue)}
              style={{
                cursor: "pointer",
                width: "24px",
                height: "24px",
              }}
            />
          );
        })}
      </div>
    );
  };

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
      const response = await apiRequest("get", `/documents`, {}, token);

      if (response) {
        const approvedDocuments = response.data.filter(
          (doc) => doc.status === "approved"
        );
        setDocuments(approvedDocuments);
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

  const [ongoing, setongoing] = useState([]);

  const fetchOngoingProjects = useCallback(async () => {
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
        setongoing(response.data.data.projects);
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

  useEffect(() => {
    fetchOngoingProjects();
  }, [fetchOngoingProjects]);

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
  const sliderRefReportsTwo = useRef(null);
  const sliderRefReportsThree = useRef(null);

  const handlePrevClickProjects = () => {
    if (sliderRefProjects.current) {
      sliderRefProjects.current.slickPrev();
    }
  };

  const handlePrevClickProjectsTwo = () => {
    if (sliderRefReportsTwo.current) {
      sliderRefReportsTwo.current.slickPrev();
    }
  };

  const handlePrevClickProjectsThree = () => {
    if (sliderRefReportsThree.current) {
      sliderRefReportsThree.current.slickPrev();
    }
  };

  const handleNextClickProjects = () => {
    if (sliderRefProjects.current) {
      sliderRefProjects.current.slickNext();
    }
  };

  const handleNextClickProjectsTwo = () => {
    if (sliderRefReportsTwo.current) {
      sliderRefReportsTwo.current.slickNext();
    }
  };

  const handleNextClickProjectsThree = () => {
    if (sliderRefReportsThree.current) {
      sliderRefReportsThree.current.slickNext();
    }
  };

  const handleViewProjectClick = (id) => {
    navigate(`/details/${id}`);
  };

  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [modalDocuments, setModalDocuments] = useState([]);

  const openModal = (projectId) => {
    setIsModalOpen(true);
    setSelectedProjectId(projectId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchProjectByID = useCallback(
    async (projectId) => {
      try {
        const response = await apiRequest(
          "get",
          `/projects/${projectId}`,
          {},
          token
        );
        if (response?.data?.statusCode === 200) {
          const data = response?.data?.data;
          setModalDocuments(data.documents);
          console.log("Data is:", modalDocuments);
        } else {
          setError("Project not found.");
        }
      } catch (error) {
        setError("Error fetching project data");
      }
    },
    [token]
  );

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectByID(selectedProjectId);
    }
  }, [selectedProjectId, fetchProjectByID]);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
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
                {t("Ongoing_Projects")}
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
                {ongoing.length > 0 ? (
                  ongoing?.map((project, index) => (
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
                          onClick={() => handleViewProjectClick(project._id)}
                        >
                          {project.projectBanner.map((banner, index) => (
                            <SwiperSlide key={banner._id || index}>
                              <img
                                className="w-full h-32 cursor-pointer object-cover rounded"
                                src={banner.url}
                                alt={`Project Banner ${index + 1}`}
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      ) : (
                        <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-200 rounded">
                          {/* <FaRecordVinyl className="w-8 h-8 text-gray-500" /> */}
                          <p className="text-gray-500 text-sm mt-1">
                            <img src={logo} alt="" />
                          </p>
                        </div>
                      )}
                      {/* Content */}
                      <div>
                        <div
                          onClick={() => handleViewProjectClick(project._id)}
                          className="cursor-pointer"
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
                            <span className="text-sm text-black mb-1">
                              {" "}
                              {project.status === "Pending"
                                ? t("Pending")
                                : project.status === "Completed"
                                ? t("Completed")
                                : project.status === "Ongoing"
                                ? t("Ongoing")
                                : project.daysLeft}
                            </span>
                          </div>

                          {/* Progress Bars */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-black font-medium text-sm">
                                {t("Physical_Execution")}
                              </p>
                              <h6 className="text-gray-800 font-semibold">
                                {project?.financeDocuments?.[0]
                                  ?.physicalExecution || 0}{" "}
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
                                {project?.financeDocuments?.[0]
                                  ?.financialExecution || 0}{" "}
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
                        <div>
                          {/* Button to open the modal */}
                          <button
                            className="text-[#54577A] underline"
                            onClick={() => openModal(project._id)}
                          >
                            {t("deliverables_attached")}
                          </button>

                          {/* Modal */}
                          <Modal
                            open={isModalOpen}
                            onClose={closeModal}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                          >
                            <Box
                              sx={{
                                ...modalStyle,
                                borderRadius: "16px",
                                height: "470px",
                                display: "flex",
                                flexDirection: "column",
                                padding: "24px",
                              }}
                            >
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-black-blacknew">
                                  {t("Deliverables_Attached")}
                                </h2>
                                <button
                                  onClick={closeModal}
                                  className="text-black-blacknew font-bold hover:text-gray-700 focus:outline-none"
                                  aria-label="Close"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="mt-4 flex-grow scrollbar-custom">
                                <h3 className="block text-sm font-semibold mb-4 text-gray-700">
                                  {t("Attached_Documents")}
                                </h3>
                                {modalDocuments && modalDocuments.length > 0 ? (
                                  <ul className="space-y-4">
                                    {modalDocuments.map((file, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start bg-gray-100 p-3 rounded-lg"
                                      >
                                        {/* PDF Icon */}
                                        <div className="w-14 h-14 flex items-center justify-center bg-gray-200 rounded-lg">
                                          <img
                                            src={pdf}
                                            alt="PDF Icon"
                                            className="w-10 h-10"
                                          />
                                        </div>
                                        {/* File Details */}
                                        <div className="ml-3 flex-1">
                                          <p className="text-sm font-semibold text-gray-700">
                                            {file.fileName}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            Uploaded by: {file.user}
                                          </p>
                                        </div>
                                        {/* Download Button (Optional) */}
                                        <a
                                          href={file.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-500 hover:text-blue-700"
                                        >
                                          <Button
                                            startIcon={
                                              <MdOutlineFileDownload
                                                size={40}
                                              />
                                            }
                                            sx={{
                                              textTransform: "none",
                                              color: "#121619",
                                            }}
                                          ></Button>
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500">
                                    {t("No_files_attached")}
                                  </p>
                                )}
                              </div>

                              <div className="flex justify-between mt-4 w-full">
                                <button
                                  onClick={closeModal}
                                  className="px-4 py-3 w-full ml-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none"
                                >
                                  {t("Cancel")}
                                </button>
                              </div>
                            </Box>
                          </Modal>
                        </div>
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

        <section className="w-full flex justify-between gap-6 mt-14 flex-col">
          <header className="mb-6 flex justify-between">
            <h2 className="text-2xl font-bold text-black">
              {t("Latest_Reports")}
            </h2>
            <div className="flex">
              <button
                onClick={handlePrevClickProjectsTwo}
                className="p-1 rounded-full"
              >
                <GrFormPrevious
                  className="text-gray-600 slick-arrow"
                  size={18}
                />
              </button>
              <button
                onClick={handleNextClickProjectsTwo}
                className="p-1 rounded-full"
              >
                <GrFormNext className="slick-arrow" size={18} />
              </button>
            </div>
          </header>
          {documents.length > 0 ? (
            <Slider ref={sliderRefReportsTwo} {...settings} className="w-full">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="md:w-[500px] h-[200px] rounded-[10px] bg-white shadow-lg flex justify-center items-center mx-auto"
                >
                  <div className="flex flex-col bg-white rounded-[10px] p-4 w-full">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={doc.projectBanner?.[0]?.url || logo}
                        alt="Project Banner"
                        className="w-14 h-14 rounded-full object-contain"
                      />
                      <div>
                        <h3 className="font-semibold text-base sm:block">
                          {doc.projName}
                        </h3>
                        <p className="text-lightpurple-light text-sm sm:block">
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
            <p className="text-gray-500 text-center w-full">
              No documents found.
            </p>
          )}
        </section>

        <div className="w-full max-w-7xl my-10">
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
                          onClick={() => handleViewProjectClick(project._id)}
                        >
                          {project.projectBanner.map((banner, index) => (
                            <SwiperSlide key={banner._id || index}>
                              <img
                                className="w-full h-32 cursor-pointer object-cover rounded"
                                src={banner.url}
                                alt={`Project Banner ${index + 1}`}
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      ) : (
                        <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-200 rounded">
                          {/* <FaRecordVinyl className="w-8 h-8 text-gray-500" /> */}
                          <p className="text-gray-500 text-sm mt-1">
                            <img src={logo} alt="" />
                          </p>
                        </div>
                      )}
                      {/* Content */}
                      <div>
                        <div
                          onClick={() => handleViewProjectClick(project._id)}
                          className="cursor-pointer"
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
                            <span className="text-sm text-black mb-1">
                              {" "}
                              {project.status === "Pending"
                                ? t("Pending")
                                : project.status === "Completed"
                                ? t("Completed")
                                : project.status === "Ongoing"
                                ? t("Ongoing")
                                : project.daysLeft}
                            </span>
                          </div>

                          {/* Progress Bars */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-black font-medium text-sm">
                                {t("Physical_Execution")}
                              </p>
                              <h6 className="text-gray-800 font-semibold">
                                {project?.financeDocuments?.[0]
                                  ?.physicalExecution || 0}{" "}
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
                                {project?.financeDocuments?.[0]
                                  ?.financialExecution || 0}{" "}
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
                        <div>
                          {/* Button to open the modal */}
                          <button
                            className="text-[#54577A] underline"
                            onClick={() => openModal(project._id)}
                          >
                            {t("deliverables_attached")}
                          </button>

                          {/* Modal */}
                          <Modal
                            open={isModalOpen}
                            onClose={closeModal}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                          >
                            <Box
                              sx={{
                                ...modalStyle,
                                borderRadius: "16px",
                                height: "470px",
                                display: "flex",
                                flexDirection: "column",
                                padding: "24px",
                              }}
                            >
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-black-blacknew">
                                  {t("Deliverables_Attached")}
                                </h2>
                                <button
                                  onClick={closeModal}
                                  className="text-black-blacknew font-bold hover:text-gray-700 focus:outline-none"
                                  aria-label="Close"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="mt-4 flex-grow scrollbar-custom">
                                <h3 className="block text-sm font-semibold mb-4 text-gray-700">
                                  {t("Attached_Documents")}
                                </h3>
                                {modalDocuments && modalDocuments.length > 0 ? (
                                  <ul className="space-y-4">
                                    {modalDocuments.map((file, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start bg-gray-100 p-3 rounded-lg"
                                      >
                                        {/* PDF Icon */}
                                        <div className="w-14 h-14 flex items-center justify-center bg-gray-200 rounded-lg">
                                          <img
                                            src={pdf}
                                            alt="PDF Icon"
                                            className="w-10 h-10"
                                          />
                                        </div>
                                        {/* File Details */}
                                        <div className="ml-3 flex-1">
                                          <p className="text-sm font-semibold text-gray-700">
                                            {file.fileName}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            Uploaded by: {file.user}
                                          </p>
                                        </div>
                                        {/* Download Button (Optional) */}
                                        <a
                                          href={file.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-500 hover:text-blue-700"
                                        >
                                          <Button
                                            startIcon={
                                              <MdOutlineFileDownload
                                                size={40}
                                              />
                                            }
                                            sx={{
                                              textTransform: "none",
                                              color: "#121619",
                                            }}
                                          ></Button>
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500">
                                    {t("No_files_attached")}
                                  </p>
                                )}
                              </div>

                              <div className="flex justify-between mt-4 w-full">
                                <button
                                  onClick={closeModal}
                                  className="px-4 py-3 w-full ml-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none"
                                >
                                  {t("Cancel")}
                                </button>
                              </div>
                            </Box>
                          </Modal>
                        </div>
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

        <div className="w-full max-w-7xl mt-10">
          <div className="h-full slider-container">
            <header className="mb-6 flex justify-between">
              <h2 className="text-2xl font-bold text-black">
                {t("Completed_Projects")}
              </h2>
              <div className="flex">
                <button
                  onClick={handlePrevClickProjectsThree}
                  className="p-1 rounded-full"
                >
                  <GrFormPrevious
                    className="text-gray-600 slick-arrow"
                    size={18}
                  />
                </button>
                <button
                  onClick={handleNextClickProjectsThree}
                  className="p-1 rounded-full"
                >
                  <GrFormNext className="slick-arrow" size={18} />
                </button>
              </div>
            </header>

            {/* Slider Section */}
            <div className="slider-container ">
              <Slider ref={sliderRefReportsThree} {...settings}>
                {completed.length > 0 ? (
                  completed?.map((project, index) => (
                    <div
                      key={project._id}
                      className="bg-white rounded-lg cursor-pointer shadow-lg p-4 flex flex-col "
                    >
                      {/* Image */}
                      {project.projectBanner?.length > 0 ? (
                        <Swiper
                          spaceBetween={10}
                          slidesPerView={1}
                          grabCursor={true}
                          onClick={() => handleViewProjectClick(project._id)}
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
                            <img src={logo} alt="" />
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
                            <span className="text-sm text-black mb-1">
                              {" "}
                              {project.status === "Pending"
                                ? t("Pending")
                                : project.status === "Completed"
                                ? t("Completed")
                                : project.status === "Ongoing"
                                ? t("Ongoing")
                                : project.daysLeft}
                            </span>
                          </div>

                          {/* Progress Bars */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-black font-medium text-sm">
                                {t("Physical_Execution")}
                              </p>
                              <h6 className="text-gray-800 font-semibold">
                                {project?.financeDocuments?.[0]
                                  ?.physicalExecution || 0}{" "}
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
                                  {project?.financeDocuments?.[0]
                                    ?.financialExecution || 0}{" "}
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
                        <div className="flex justify-between items-center mb-4">
                          <button
                            className="text-[#54577A] underline"
                            onClick={() => openModal(project._id)}
                          >
                            {t("deliverables_attached")}
                          </button>
                          <button
                            className="text-[#54577A] underline"
                            onClick={() => {
                              setSelectedProjectId(project._id); 
                              openReviewModal();
                            }}
                          >
                            {t("Write a Review")}
                          </button>
                        </div>
                        <Modal
                          open={isReviewModalOpen}
                          onClose={closeReviewModal}
                          aria-labelledby="review-modal-title"
                          aria-describedby="review-modal-description"
                        >
                          <Box
                            sx={{
                              ...modalStyle,
                              borderRadius: "16px",
                              height: "auto",
                              width: "600px",
                              display: "flex",
                              flexDirection: "column",
                              padding: "24px",
                              position: "relative", // needed for absolute positioning of the close button
                            }}
                          >
                            {/* Close Icon */}
                            <button
                              onClick={closeReviewModal}
                              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
                              aria-label="Close"
                            >
                              ×
                            </button>

                            <h2
                              id="review-modal-title"
                              className="flex justify-center text-xl font-semibold text-black-blacknew mb-4"
                            >
                              {t("Write a Review")}
                            </h2>

                            <StarRating
                              rating={rating}
                              onRatingChange={handleRatingChange}
                            />
                            <h4 className="text-xl font-medium text-black-blacknew">
                              {t("Write a Description")}
                            </h4>
                            <textarea
                              id="review-modal-description"
                              className="w-full h-32 p-2 border border-gray-300 rounded-xl mt-4"
                              placeholder={t("Your_review_here")}
                              value={reviewText}
                              onChange={handleReviewTextChange}
                            ></textarea>

                            <div className="flex justify-end mt-8 gap-2">
                              <button
                                onClick={handleSubmitReview}
                                className="px-4 py-2 text-sm font-semibold text-white bg-black-blacknew rounded-lg focus:outline-none"
                              >
                                {t("Submit Review")}
                              </button>
                              <button
                                onClick={closeReviewModal}
                                className="px-4 py-2 mr-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none"
                              >
                                {t("Cancel")}
                              </button>
                            </div>
                          </Box>
                        </Modal>
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
