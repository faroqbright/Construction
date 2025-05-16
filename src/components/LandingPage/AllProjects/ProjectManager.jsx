import { useEffect, useState, useCallback } from "react";
import {
  Stack,
  Chip,
  Skeleton,
  Pagination,
  PaginationItem,
  Modal,
  Box,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import time from "../../../assets/Time Circle.svg";
import logo from "../../../assets/logo1.png";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { removeUserInfo } from "../../../features/auth/authSlice";
import RolePermissions from "../../../utils/RolePermissions";
import { CiSearch } from "react-icons/ci";
import { FaArrowLeft } from "react-icons/fa6";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { Trash2, User, X } from "lucide-react";

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = useSelector((state) => state?.auth?.userToken);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [modalTeamMembers, setModalTeamMembers] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const openModal = (projectId) => {
    setIsModalOpen(true);
    setSelectedProjectId(projectId);
  };
  const closeModal = () => setIsModalOpen(false);

  const handleDeleteProjectClick = (projectId) => {
    setProjectToDelete(projectId);
    setDeleteModalOpen(true);
  };

  const handleDeleteProject = async () => {
    try {
      const response = await apiRequest(
        "delete",
        `/projects/${projectToDelete}`,
        {},
        token
      );

      if (response?.data?.statusCode === 200) {
        toast.success(t("Project_Successfully_Deleted"));
        const updatedProjects = projects.filter(
          (project) => project._id !== projectToDelete
        );
        setProjects(updatedProjects);
      } else {
        toast.error(t("Failed_to_delete_project"));
      }
    } catch (error) {
      toast.error(t("Error_deleting_project"));
    } finally {
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleMoreClick = () => {
    if (visibleIndex + 3 < projects.members.length) {
      setVisibleIndex(visibleIndex + 2);
    } else {
      setVisibleIndex(0);
    }
  };

  useEffect(() => {
    const fetchProjects = async (page) => {
      setLoading(true);
      try {
        const formattedStatus =
          selectedTab !== "All_Projects"
            ? selectedTab.charAt(0).toUpperCase() +
              selectedTab.slice(1).toLowerCase()
            : undefined;

        const response = await apiRequest(
          "get",
          "/projects",
          { status: formattedStatus, page },
          token
        );

        if (response?.data?.statusCode === 200) {
          setProjects(response?.data?.data?.projects || []);
          setCurrentPage((prev) =>
            prev === response?.data?.data?.currentPage
              ? prev
              : response?.data?.data?.currentPage
          );
          setTotalPages(response?.data?.data?.totalPages || 1);
        }
      } catch (error) {
        if (error && error?.status === 401) {
          dispatch(removeUserInfo());
          toast.success(t("You have been logged out."));
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects(currentPage);
  }, [currentPage, selectedTab, token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  const tabs = [
    { label: t("All"), value: "All" },
    { label: t("Ongoing"), value: "Ongoing" },
    { label: t("Pending"), value: "Pending" },
    { label: t("Completed"), value: "Completed" },
  ];

  const handleTabClick = (tabValue) => {
    setSelectedTab(tabValue);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleProjectClick = (id) => {
    navigate(`/details/${id}`);
  };

  const handleEditProjectClick = (id) => {
    navigate(`/details/edit/${id}`);
  };

  const handleViewProjectClick = (id) => {
    navigate(`/details/view/${id}`);
  };

  const handleViewDashboard = (id) => {
    navigate("/");
  };

  const hasProjReadPermission = RolePermissions("ProjectsManagement", "read");
  const hasProjUpdatePermission = RolePermissions(
    "ProjectsManagement",
    "update"
  );
  const hasProjCreatePermission = RolePermissions(
    "ProjectsManagement",
    "create"
  );
  const hasProjDeletePermission = RolePermissions(
    "ProjectsManagement",
    "delete"
  );

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
          setModalTeamMembers(data.members);
        } else {
          setError(t("Project not found."));
        }
      } catch (error) {
        setError(t("Error fetching project data"));
      }
    },
    [token]
  );

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectByID(selectedProjectId);
    }
  }, [selectedProjectId, fetchProjectByID]);

  const filteredProjects = projects.filter((project) =>
    project.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
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

  return (
    <>
      <div className="flex flex-col rounded-lg w-full px-8 py-2">
        <div className="flex flex-row justify-between">
          <div className="flex items-center space-x-3 mb-10">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-200 transition"
              onClick={handleViewDashboard}
            >
              <FaArrowLeft className="text-black w-5 h-5" />
            </button>
            <span className="text-black font-bold text-lg">
              {t("All_Projects")}
            </span>
          </div>
          <TextField
            placeholder={t("Write_Your_Message")}
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CiSearch className="w-5 h-5 text-black-blacknew font-bold" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "0.5rem",
                backgroundColor: "white",
                "& fieldset": {
                  borderColor: "#e0e0e0",
                },
                "&:hover fieldset": {
                  borderColor: "black",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "black",
                },
              },
            }}
            variant="outlined"
            className="w-[24rem]"
          />
        </div>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          className="w-full"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={5}>
            {tabs.map(({ label, value }) => (
              <Chip
                key={value}
                label={label}
                onClick={() => handleTabClick(value)}
                sx={{
                  py: 3,
                  px: 3,
                  borderRadius: "9999px",
                  backgroundColor: selectedTab === value ? "#B91724" : "white",
                  color: selectedTab === value ? "white" : "black",
                  fontWeight: selectedTab === value ? "bold" : "normal",
                  "&:hover": {
                    backgroundColor:
                      selectedTab === value ? "#B91724" : "lightgray",
                  },
                }}
              />
            ))}
          </Stack>

          {hasProjCreatePermission && (
            <div className="w-full flex justify-end p-4">
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/details/create");
                }}
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#333333",
                  },
                }}
              >
                + {t("Create_New_Project")}
              </Button>
            </div>
          )}
        </Stack>
        <div className="flex p-2 justify-between mt-6">
          <span className="text-black font-bold">
            {selectedTab === "All"
              ? t("All_Projects")
              : selectedTab === "Ongoing"
              ? t("Ongoing_Projects")
              : selectedTab === "Pending"
              ? t("Pending_Projects")
              : t("Completed_Projects")}
          </span>
          <div className="flex">
            <button
              onClick={handlePrevClickProjects}
              className="p-1 rounded-full"
            >
              <GrFormPrevious className="text-gray-600 slick-arrow" size={18} />
            </button>
            <button
              onClick={handleNextClickProjects}
              className="p-1 rounded-full"
            >
              <GrFormNext className="slick-arrow" size={18} />
            </button>
          </div>
        </div>

        {hasProjReadPermission ? (
          <div className="my-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  lg:gap-9">
            {loading &&
              Array.from(new Array(6)).map((_, index) => (
                <div
                  key={index}
                  className="max-w-sm h-[22rem] md:h-[18.9rem] rounded overflow-hidden shadow-lg bg-white p-5 text-[0.7rem]"
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
            {error && <div>{error}</div>}
            {filteredProjects.length === 0 && !loading && (
              <div>{t("No_projects_available")}</div>
            )}
            {filteredProjects.length > 0 &&
              filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="max-w-sm h-[22rem] md:h-[22rem] rounded overflow-hidden shadow-lg bg-white p-5 text-[0.7rem]"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => handleProjectClick(project._id)}
                  >
                    {project.projectBanner?.length > 0 ? (
                      <Swiper
                        spaceBetween={10}
                        slidesPerView={1}
                        grabCursor={true}
                        onClick={() => handleProjectClick(project._id)}
                      >
                        {project.projectBanner.map((banner, index) => (
                          <SwiperSlide
                            key={banner._id || index}
                            className="w-[300px]"
                          >
                            <img
                              className="w-[300px] h-32 object-cover rounded"
                              src={banner.url}
                              alt={`Project Banner ${index + 1}`}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    ) : (
                      <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-200 rounded">
                        <img src={logo} alt="" />
                      </div>
                    )}

                    <div className="flex justify-between py-2">
                      <div
                        className="font-semibold truncate w-2/4"
                        title={project.projectName}
                      >
                        {project.projectName}
                      </div>
                      <div className="font-semibold flex items-center">
                        <img className="flex" src={time} alt="" />
                        <span className="ml-1">
                          {project.status === "Pending"
                            ? t("Pending")
                            : project.status === "Completed"
                            ? t("Completed")
                            : project.status === "Ongoing"
                            ? t("Ongoing")
                            : project.daysLeft}
                        </span>
                      </div>
                    </div>

                    <div className="font-bold">
                      {t("Deadline")} <span>{project.deadline}</span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-black font-medium text-sm">
                          {t("Physical_Execution")}
                        </p>
                        <h6 className="text-gray-800 font-semibold">
                          {project?.financeDocuments?.[0]?.physicalExecution ||
                            0}{" "}
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
                          {project?.financeDocuments?.[0]?.financialExecution ||
                            0}{" "}
                          %
                        </h6>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full relative">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            project?.financeDocuments?.[0]?.financialExecution >
                            0
                              ? "bg-red-500"
                              : "bg-gray-300"
                          }`}
                          style={{
                            width: `${project?.financeDocuments?.[0]?.financialExecution}%`,
                          }}
                        ></div>
                        <div
                          className="w-5 h-5 bg-red-redNew rounded-full absolute top-1/2 -translate-y-1/2 
                 flex items-center justify-center shadow-md cursor-pointer transition-all"
                          style={{
                            left: `calc(${project?.financeDocuments?.[0]?.financialExecution}% - 10px)`,
                          }}
                        >
                          <span className="w-2 h-2 bg-red-redNew rounded-full"></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="mt-4 flex items-center">
                    {project.members
                      .slice(visibleIndex, visibleIndex + 3)
                      .map((member) =>
                        member.avatar ? (
                          <img
                            key={member._id}
                            className="w-8 h-8 rounded-full"
                            src={member.avatar}
                            onClick={() => openModal(project._id)}
                            alt="Member"
                          />
                        ) : (
                          <User
                            key={member._id}
                            className="bg-slate-400 rounded-full p-2 text-white"
                            size={32}
                            onClick={() => openModal(project._id)}
                          />
                        )
                      )}

                    <>
                      {project.members.length > 3 && (
                        <div className="flex justify-between text-nowrap">
                          <span
                            onClick={handleMoreClick}
                            className="text-blue-500 underline mx-3 cursor-pointer"
                          >
                            +{project.members.length - (visibleIndex + 3)}{" "}
                            {t("More")}
                          </span>
                        </div>
                      )}
                      {!projects?.fromBusinessArea &&  (
                        <>
                          <h6
                            onClick={() =>
                              project.status !== "Completed"
                                ? handleEditProjectClick(project._id)
                                : handleViewProjectClick(project._id)
                            }
                            className="text-blue-500 cursor-pointer pl-28 underline ml-3 text-nowrap"
                          >
                            {project.status !== t("Completed")
                              ? hasProjUpdatePermission
                                ? t("Add_Information")
                                : t("View_Project")
                              : t("View_Project")}
                          </h6>

                          {hasProjDeletePermission && (
                            <h6
                              onClick={() =>
                                handleDeleteProjectClick(project._id)
                              }
                              className="text-blue-500 cursor-pointer underline ml-3 text-nowrap"
                            >
                              <Trash2 className="text-red-redNew" size={16} />{" "}
                            </h6>
                          )}
                        </>
                      )}
                    </>
                  </div> */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {project.members
                        .slice(visibleIndex, visibleIndex + 3)
                        .map((member) =>
                          member.avatar ? (
                            <img
                              key={member._id}
                              className="w-8 h-8 rounded-full mr-2"
                              src={member.avatar}
                              onClick={() => openModal(project._id)}
                              alt="Member"
                            />
                          ) : (
                            <User
                              key={member._id}
                              className="bg-slate-400 rounded-full p-2 text-white mr-2"
                              size={32}
                              onClick={() => openModal(project._id)}
                            />
                          )
                        )}

                      {project.members.length > 3 && (
                        <span
                          onClick={handleMoreClick}
                          className="text-blue-500 underline mx-1 cursor-pointer text-sm"
                        >
                          +{project.members.length - (visibleIndex + 3)}{" "}
                          {t("More")}
                        </span>
                      )}
                    </div>

                    {!projects?.fromBusinessArea && (
                      <div className="flex items-center space-x-2 ml-2">
                        <span
                          onClick={() =>
                            project.status !== "Completed"
                              ? handleEditProjectClick(project._id)
                              : handleViewProjectClick(project._id)
                          }
                          className="text-blue-500 cursor-pointer underline text-sm whitespace-nowrap"
                        >
                          {project.status !== t("Completed")
                            ? hasProjUpdatePermission
                              ? t("Add_Information")
                              : t("View_Project")
                            : t("View_Project")}
                        </span>

                        {hasProjDeletePermission && (
                          <Trash2
                            onClick={() =>
                              handleDeleteProjectClick(project._id)
                            }
                            className="text-red-redNew cursor-pointer"
                            size={16}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                    {t("View")} {t("Members")}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-black-blacknew font-bold hover:text-gray-700 focus:outline-none"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                {/* <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    {t("Team_Members")}
                  </label>
                  <select className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none">
                    <option value="" disabled selected hidden>
                      {t("Select_One_or_more")}...
                    </option>
                  </select>
                </div> */}

                <div className="mt-4 flex-grow scrollbar-custom">
                  <h3 className="block text-sm font-semibold mb-4 text-gray-700">
                    {t("Added_Members")}
                  </h3>
                  {modalTeamMembers && modalTeamMembers.length > 0 ? (
                    <ul className="space-y-2">
                      {modalTeamMembers.map((member) => (
                        <li
                          key={member._id}
                          className="flex items-center bg-gray-100 p-2 rounded-lg gap-3"
                        >
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.userName}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          ) : (
                            <User
                              key={member._id}
                              className="bg-slate-400 rounded-full p-2 text-white"
                              size={32}
                            />
                          )}

                          <span>{member.userName}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">{t("No_members")}</p>
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
            <Modal
              open={deleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              aria-labelledby="delete-confirmation-modal"
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 600, // Increased width
                  height: 200, // Increased height
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: "8px",
                }}
              >
                {/* Header with Title + Close Icon */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {t("Delete_Project_Confirmation")}
                  </h2>
                  <button onClick={() => setDeleteModalOpen(false)}>
                    <X className="text-gray-500 hover:text-black" size={20} />
                  </button>
                </div>

                <p className="mb-6 text-sm text-gray-700">
                  {t("Are_you_sure_you_want_to_delete_this_project?")}
                </p>

                <div className="flex justify-end space-x-4">
                  <Button
                    variant="contained"
                    onClick={handleDeleteProject}
                    sx={{
                      backgroundColor: "#B91724",
                      "&:hover": {
                        backgroundColor: "#9a1420",
                      },
                    }}
                  >
                    {t("Yes")}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setDeleteModalOpen(false)}
                    sx={{
                      color: "black",
                      borderColor: "gray",
                      "&:hover": {
                        borderColor: "gray",
                      },
                    }}
                  >
                    {t("No")}
                  </Button>
                </div>
              </Box>
            </Modal>
          </div>
        ) : null}
        <div className="flex justify-center mt-4">
          <Pagination
            count={totalPages}
            page={currentPage}
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
                  previous: () => <span>{t("Previos")}</span>,
                  next: () => <span>{t("Next")}</span>,
                }}
                sx={{
                  "&.MuiPaginationItem-previous, &.MuiPaginationItem-next": {
                    color: "black",
                    fontWeight: "bold",
                  },
                }}
              />
            )}
          />
        </div>
      </div>
    </>
  );
};

export default ProjectManager;
