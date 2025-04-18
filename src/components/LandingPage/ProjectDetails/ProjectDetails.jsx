import React, { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, Checkbox, Pagination, PaginationItem } from "@mui/material";
import pdf from "../../../assets/pdf.svg";
import "react-circular-progressbar/dist/styles.css";
import { FaUser, FaFileAlt, FaCreditCard, FaCheck } from "react-icons/fa";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { useNavigate, useParams } from "react-router-dom";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Slider from "react-slick";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "react-toastify";
import logo from "../../../assets/logo1.png";

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.userToken);
  const { id } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [financialId, setFinancialId] = useState(null);

  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: "Project Kickoff",
      description: "Initial meeting and requirements gathering",
      checked: false,
    },
    {
      id: 2,
      title: "Design Approval",
      description: "Review and finalize UI/UX designs",
      checked: false,
    },
    {
      id: 3,
      title: "Final Delivery",
      description: "Project completion and handover",
      checked: false,
    },
  ]);

  const toggleCheck = (id) => {
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id
          ? { ...milestone, checked: !milestone.checked }
          : milestone
      )
    );
  };

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

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedFinanceDocuments = projectData?.financeDocuments?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const capitalizeWords = (str) => {
    return str
      ?.split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const sliderRefProjects = useRef(null);
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

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
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

  // Initialize as numbers (0 instead of "0%")
  const [physicalExecution, setPhysicalExecution] = useState(0);
  const [financialExecution, setFinancialExecution] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragTimeout = useRef(null);

  const physicalExecutionRef = useRef(physicalExecution);
  const financialExecutionRef = useRef(financialExecution);

  useEffect(() => {
    if (projectData?.financeDocuments?.length) {
      const firstDoc = projectData.financeDocuments[0];
      setPhysicalExecution(parseFloat(firstDoc?.physicalExecution) || 0);
      setFinancialExecution(parseFloat(firstDoc?.financialExecution) || 0);
      setFinancialId(firstDoc?.id || null);
    } else {
      // If no finance documents, reset values and disable dragging
      setPhysicalExecution(0);
      setFinancialExecution(0);
      setFinancialId(null);
    }
  }, [projectData]);

  // Check if dragging should be enabled
  const canDrag = projectData?.financeDocuments?.length > 0;

  const handleDrag = (e, type) => {
    if (!canDrag) return;

    setDragging(true);
    const rect = e.target.parentElement.getBoundingClientRect();
    let newValue = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    newValue = Math.max(0, Math.min(100, newValue));

    if (type === "physical") {
      setPhysicalExecution(newValue);
      physicalExecutionRef.current = newValue;
    }
    if (type === "financial") {
      setFinancialExecution(newValue);
      financialExecutionRef.current = newValue;
    }
  };

  const handleDragEnd = () => {
    if (!canDrag) return;

    setDragging(false);
    if (dragTimeout.current) clearTimeout(dragTimeout.current);

    dragTimeout.current = setTimeout(async () => {
      if (financialId) {
        try {
          await apiRequest(
            "patch",
            `/finance/${financialId}`,
            {
              physicalExecution: physicalExecutionRef.current,
              financialExecution: financialExecutionRef.current,
            },
            token
          );
          toast.success("Execution updated successfully.");
        } catch (error) {
          toast.error("Error updating finance execution.");
        }
      }
    }, 500);
  };

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
          <div className="flex text-sm gap-4 mt-6 ">
            <div>
              <strong className="text-black-blacknew text-base">
                Business Area:{" "}
              </strong>
              <span className="text-[#54577A] font-bold text-base">
                {projectData?.businessAreas}
              </span>
            </div>
            <div>
              <strong className="text-black-blacknew text-base">
                Client Company:{" "}
              </strong>
              <span className="text-[#54577A] font-bold text-base">
                {projectData?.comapanyName}
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

        {/* <div className="p-6">
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
        </div> */}
        <div className="p-6">
          <h3 className="text-md font-semibold text-gray-800">
            {t("Project_Reports")}:
          </h3>
          <div className="flex gap-3 flex-wrap">
            {projectData?.projectReports
              ?.filter((doc) => doc.status === "approved") // Only show approved reports
              .map((doc, index) => (
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
                    <span className="text-sm font-semibold">
                      {doc.fileName}
                    </span>
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
          {/* Physical Execution */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-black font-medium text-sm">
                Physical Execution
              </p>
              <h6 className="text-gray-800 font-semibold">
                {physicalExecution}%
              </h6>
            </div>

            <div className="relative w-full h-2 bg-gray-200 rounded-full">
              <div
                className={`absolute top-0 left-0 h-2 rounded-full ${
                  projectData?.status === "Completed"
                    ? "bg-red-500"
                    : "bg-red-500"
                }`}
                style={{
                  width: `${physicalExecution}%`,
                }}
              ></div>
              <div
                className={`absolute w-5 h-5 rounded-full border-2 ${
                  canDrag
                    ? "bg-red-500 border-red-500 cursor-pointer"
                    : "bg-gray-400 border-gray-400 cursor-not-allowed"
                }`}
                style={{
                  left: `calc(${physicalExecution}% - 10px)`,
                  top: "-6px",
                }}
                onMouseDown={
                  canDrag
                    ? (e) => {
                        document.onmousemove = (ev) =>
                          handleDrag(ev, "physical");
                        document.onmouseup = () => {
                          document.onmousemove = null;
                          handleDragEnd();
                        };
                      }
                    : undefined
                }
              ></div>
            </div>
          </div>

          {/* Financial Execution */}
          <div className="mb-4 mt-2 relative">
            <div className="flex justify-between">
              <p className="black text-sm mb-1">Financial Execution</p>
              <h6 className="text-red-500">{financialExecution}%</h6>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full relative">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{
                  width: `${financialExecution}%`,
                }}
              ></div>
              <div
                className={`w-5 h-5 rounded-full absolute top-1/2 -translate-y-1/2 ${
                  canDrag
                    ? "bg-red-500 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                style={{ left: `calc(${financialExecution}% - 10px)` }}
                onMouseDown={
                  canDrag
                    ? (e) => {
                        document.onmousemove = (ev) =>
                          handleDrag(ev, "financial");
                        document.onmouseup = () => {
                          document.onmousemove = null;
                          handleDragEnd();
                        };
                      }
                    : undefined
                }
              ></div>
            </div>
          </div>
        </div>

        {/* Images Container */}
        <div className="">
          <div className="p-6">
            <div className="h-full slider-container">
              <header className="mb-6 flex justify-between items-center">
                <h3 className="text-md font-semibold text-gray-800">
                  {t("Project_Photo")}:
                </h3>
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
            </div>

            {projectData?.projectBanner?.length > 0 ? (
              <Slider ref={sliderRefProjects} {...settings} className="gap-4">
                {projectData.projectBanner.map((banner, index) => (
                  <div
                    key={banner._id}
                    className="border-[#B5C0CD] border flex flex-col items-center justify-center rounded-lg w-fit p-2"
                  >
                    <img
                      src={banner.url}
                      alt={projectData?.projectName || "Project Image"}
                      className="object-cover cursor-pointer rounded-xl w-full h-[284px]"
                      onClick={() => {
                        setSelectedImage(banner.url);
                        setSelectedImageIndex(index); // Use the correct index here
                      }}
                    />
                    <div className="flex justify-between w-full p-2">
                      <p>{t("Added_On")}</p>
                      <p>{new Date(banner.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-200 rounded">
                <img src={logo} alt="" />
                <span className="font-semibold text-sm mt-4">
                  No Images yet.
                </span>
              </div>
            )}
          </div>
        </div>

        {selectedImage !== null && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black-blacknew bg-opacity-75 z-50">
            <div className="relative bg-white rounded-2xl p-4 max-w-3xl w-[90%] h-[90%] flex flex-col items-center justify-center shadow-lg">
              <div className="absolute top-7 left-6 text-xl font-semibold text-gray-700">
                {t("Zoomed_Image")}
              </div>

              <button
                className="absolute top-7 right-6 text-black-blacknew"
                onClick={() => setSelectedImage(null)}
              >
                <X size={24} />
              </button>

              <button
                className="absolute left-4 text-white bg-red-500 rounded-full p-1.5 hover:bg-red-600"
                onClick={() => {
                  const newIndex =
                    selectedImageIndex === 0
                      ? projectData.projectBanner.length - 1
                      : selectedImageIndex - 1;
                  setSelectedImageIndex(newIndex);
                  setSelectedImage(projectData.projectBanner[newIndex].url);
                }}
              >
                <ChevronLeft size={28} />
              </button>

              <img
                src={selectedImage}
                alt="Zoomed"
                className="w-full h-[80%] mt-10 object-contain"
              />

              <button
                className="absolute right-4 text-white bg-red-500 rounded-full p-1.5 hover:bg-red-600"
                onClick={() => {
                  const newIndex =
                    selectedImageIndex === projectData.projectBanner.length - 1
                      ? 0
                      : selectedImageIndex + 1;
                  setSelectedImageIndex(newIndex);
                  setSelectedImage(projectData.projectBanner[newIndex].url);
                }}
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        )}

        {/* Project MileStone */}
        <div className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {t("Project_Milestones")}
          </h3>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center justify-between w-full">
              {projectData?.milestones?.map((milestone, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-x-4 relative"
                >
                  <div
                    className={`h-8 w-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                      milestone.completed
                        ? "border border-red-redNew text-red-redNew"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    {milestone.name === "Project Details" ? (
                      <FaUser />
                    ) : milestone.name === "Filling" ? (
                      <FaFileAlt />
                    ) : milestone.name === "Payment" ? (
                      <FaCreditCard />
                    ) : milestone.name === "Review" ? (
                      <FaFileCircleQuestion />
                    ) : milestone.name === "Completed" ? (
                      <FaCheck />
                    ) : null}
                  </div>

                  {index < projectData.milestones.length - 1 && (
                    <div
                      className={`absolute top-[28%] left-full w-[100px] lg:w-[150px] !-ml-1 h-0 border-t-2 border-dotted ${
                        milestone.completed
                          ? "border-red-redNew"
                          : "border-gray-300"
                      }`}
                      style={{ transform: "translateY(-50%)" }}
                    />
                  )}

                  <span
                    className={`text-sm font-bold transition-all duration-300 mt-3 ${
                      milestone.completed ? "text-red-redNew" : "text-gray-400"
                    }`}
                  >
                    {t(milestone.name.replace(" ", "_"))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Added Milestones
          </h3>

          {projectData?.additionalMilestones?.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center justify-between py-3 border-b"
            >
              <div>
                <h4 className="font-medium text-gray-800">
                  {milestone.id}. {milestone.title}
                </h4>
                <p className="text-sm text-gray-500">{milestone.description}</p>
              </div>
              <div
                className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                  milestone.status === "completed"
                    ? "bg-black"
                    : "border-gray-300 bg-white"
                }`}
              >
                {milestone.status === "completed" && (
                  <Check size={20} color="black" strokeWidth={4} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Finance Status */}
        <div className="mt-14 justify-between w-full p-6">
          <h3 className="text-md font-semibold text-gray-800">
            {t("Additional_Invoice")}:
          </h3>
          <div>
            <table className="min-w-full text-sm text-left border border-gray-200 mt-10">
              <thead>
                <tr>
                  <th className="p-4 border-b">
                    <Checkbox />
                  </th>
                  <th className="p-4 border-b">{t("Invoice_Name")}</th>
                  <th className="p-4 border-b">{t("Reference")}</th>
                  <th className="p-4 border-b text-center">
                    {t("Uploaded_By")}
                  </th>
                  <th className="p-4 border-b text-center">{t("Date")}</th>
                  <th className="p-4 border-b text-center">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFinanceDocuments?.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox />
                    </td>
                    <td className="p-4">
                      {doc.fileName
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </td>
                    <td className="p-4 text-center">
                      {doc.reference ? doc.reference : "-"}
                    </td>
                    <td className="p-4 text-center">
                      {doc.user
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </td>
                    <td className="p-4 text-center">
                      {new Date(doc.uploadedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 relative">
                      <button
                        className="flex items-center justify-center px-10 py-2 bg-[#F5FFE8] border-2 border-[#0ECB0A]  text-[#0ECB0A] rounded-full transition-all duration-300"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = doc.fileUrl;
                          link.setAttribute(
                            "download",
                            doc.fileUrl.split("/").pop()
                          );
                          link.setAttribute("target", "_blank");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-end mt-4">
              <Pagination
                count={Math.ceil(
                  projectData?.financeDocuments?.length / itemsPerPage
                )} // Total number of pages
                page={page}
                onChange={handlePageChange}
                sx={{
                  "& .Mui-selected": {
                    backgroundColor: "#FBBA06 !important",
                    color: "white",
                  },
                }}
                renderItem={(item) => (
                  <PaginationItem
                    {...item}
                    components={{
                      previous: () => <span>{t("Previous")}</span>,
                      next: () => <span>{t("Next")}</span>,
                    }}
                    sx={{
                      "&.MuiPaginationItem-previous, &.MuiPaginationItem-next":
                        {
                          color: "black",
                          fontWeight: "bold",
                        },
                    }}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Client Members */}
        <div className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-black-blacknew">
            {t("Company Team")}
          </h3>
          <div className="flex flex-col gap-4 mt-4">
            {projectData?.members?.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <Avatar
                  src={member.avatar || "https://via.placeholder.com/40"}
                  alt={member.name}
                />
                <span className="text-sm text-black-blacknew">
                  {capitalizeWords(member?.userName)}{" "}
                  {member?.role?.roleName
                    ? `(${capitalizeWords(member.role.roleName)})`
                    : `(${capitalizeWords(member?.userType)})`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-black-blacknew">
            {t("Soapro Team")}
          </h3>
          <div className="flex flex-col gap-4 mt-4">
            {projectData?.projectOwners?.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <Avatar
                  src={member.avatar || "https://via.placeholder.com/40"}
                  alt={member.name}
                />
                <span className="text-sm text-black-blacknew">
                  {capitalizeWords(member?.ownerName)}{" "}
                  {member?.role
                    ? `(${capitalizeWords(member?.role)})`
                    : `(${capitalizeWords(member?.userType)})`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-5 pr-6 pb-6">
          {projectData?.fromBusinessArea === false && (
            <button
              onClick={() => navigate(`/details/edit/${projectData?._id}`)}
              className="px-5 py-2 bg-black-blacknew text-white rounded-md"
            >
              {t("Add_Information")}
            </button>
          )}
          <button className="px-5 py-2 rounded-md bg-gray-100">
            View Change Log
          </button>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
