import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Checkbox,
  Pagination,
  PaginationItem,
  Modal,
  Box,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import { RiCloseLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";
import { removeUserInfo } from "../../../features/auth/authSlice";
import RolePermissions from "../../../utils/RolePermissions";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";

const MilestoneTable = () => {
  const [openStates, setOpenStates] = useState({});
  const [open, setOpen] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    completedAt: null,
    userId: "",
    projectName: "",
    projectId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state?.auth?.userToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const _id = useSelector((state) => state?.auth?.userInfo?._id);

  const filteredProjects = projects.filter((project) =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setOpenStates({});
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchMilestones = useCallback(async () => {
    try {
      const response = await apiRequest(
        "get",
        `/additional/user/${_id}`,
        {},
        token
      );
      if (response.data && Array.isArray(response.data.data)) {
        setMilestones(response.data.data);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.success(t("You have been logged out."));
        navigate("/login");
      }
    }
  }, [token, dispatch, navigate, page, _id]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/projects", {}, token);
        if (response?.data?.statusCode === 200) {
          setProjects(response?.data?.data?.projects || []);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleOpen = (milestone = null) => {
    setEditData(milestone);
    if (milestone) {
      setFormData({
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        completedAt: milestone.completedAt || null,
        userId: milestone.userId,
        projectName: milestone.projectName,
        projectId: milestone.projectId,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "pending",
        completedAt: null,
        userId: _id,
        projectName: "",
        projectId: "",
      });
    }
    setSearchTerm("");
    setIsProjectDropdownOpen(false);
    setOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editData) {
      handleEditSubmit();
    } else {
      handleAdd();
    }
  };

  const handleClose = () => {
    setEditData(null);
    setOpen(false);
  };

  const toggleRow = (index) => {
    setOpenStates((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleAdd = async () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.status.trim() ||
      !formData.projectId.trim()
    ) {
      toast.error(t("All fields are required."));
      return;
    }
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        completedAt:
          formData.status === "completed" ? new Date().toISOString() : null,
        userId: formData.userId,
        projectName: formData.projectName,
      };

      const response = await apiRequest(
        "post",
        `/additional/milestone/${formData.projectId}`,
        payload,
        token
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(t(response.data.message));
        fetchMilestones();
        handleClose();
      } else {
        toast.error(t("Failed to add milestone."));
      }
    } catch (error) {
      toast.error(t(error.response?.data?.message) || t(error.message));
    }
  };

  const handleDelete = async (milestoneId) => {
    try {
      await apiRequest(
        "delete",
        `/additional/milestone/delete/${milestoneId}`,
        {},
        token
      );
      toast.success(t("Milestone deleted successfully."));
      fetchMilestones();
    } catch (error) {
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        completedAt:
          formData.status === "completed"
            ? formData.completedAt || new Date().toISOString()
            : null,
        projectName: formData.projectName,
      };

      await apiRequest(
        "put",
        `/additional/milestone/update/${editData._id}`,
        updatedData,
        token
      );

      toast.success(t("Milestone updated successfully."));
      fetchMilestones();
      handleClose();
    } catch (error) {
    }
  };

  const handleStatusChange = (status) => {
    setFormData({
      ...formData,
      status,
      completedAt: status === "completed" ? new Date().toISOString() : null,
    });
  };

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const modalStyles = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "8px",
    p: 4,
    width: "400px",
    maxHeight: "90vh",
    overflow: "auto",
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const hasMilestoneCreatePermission = RolePermissions(
    "MilestoneManagement",
    "create"
  );
  const hasMilestoneUpdatePermission = RolePermissions(
    "MilestoneManagement",
    "update"
  );
  const hasMilestoneDeletePermission = RolePermissions(
    "MilestoneManagement",
    "delete"
  );

  const { t } = useTranslation();

  return (
    <>
      <div className="mx-5">
        <div className="flex justify-between items-center mb-4 mx-5">
          <h2 className="text-xl font-semibold">
            {t("Additional_Milestones")}
          </h2>
          {hasMilestoneCreatePermission && (
            <Button
              variant="contained"
              onClick={() => handleOpen(null)}
              sx={{
                backgroundColor: "black",
                color: "white",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#333333",
                },
              }}
            >
              + {t("Create_New_Milestone")}
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead>
              <tr>
                <th className="p-4 border-b">
                  {/* <Checkbox /> */}
                </th>
                <th className="p-4 border-b">{t("Title")}</th>
                <th className="p-4 border-b">{t("Description")}</th>
                <th className="p-4 border-b">{t("Project")}</th>
                <th className="p-4 border-b">{t("Completed_At")}</th>
                <th className="p-4 border-b">{t("Created_At")}</th>
                <th className="p-4 border-b">{t("Status")}</th>
                {(hasMilestoneUpdatePermission ||
                  hasMilestoneDeletePermission) && (
                  <th className="p-4 border-b">{t("Actions")}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {milestones.map((milestone, idx) => (
                <tr key={milestone._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    {/* <Checkbox /> */}
                  </td>
                  <td className="p-4">{milestone.title || "-"}</td>
                  <td
                    className="p-4 max-w-xs truncate"
                    title={milestone.description}
                  >
                    {milestone.description || "-"}
                  </td>
                  <td className="p-4">{milestone.projectName}</td>
                  <td className="p-4">
                    {milestone.completedAt
                      ? new Date(milestone.completedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-4">
                    {new Date(milestone.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        milestone.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {milestone.status === "completed"
                        ? "Completed"
                        : "Pending"}
                    </span>
                  </td>
                  {(hasMilestoneUpdatePermission ||
                    hasMilestoneDeletePermission) && (
                    <td className="p-4 relative">
                      <button
                        className="text-3xl"
                        onClick={() => toggleRow(idx)}
                      >
                        ...
                      </button>
                      {openStates[idx] && (
                        <div
                          ref={modalRef}
                          className="absolute p-2 -left-10 w-[130px] mt-2 bg-white shadow-lg z-20 rounded-md"
                          style={{ top: "70%" }}
                        >
                          {hasMilestoneUpdatePermission && (
                            <Button
                              onClick={() => handleOpen(milestone)}
                              size="small"
                            >
                              <FaEdit className="text-black-blacknew" />
                              <span className="mx-3 items-center flex text-black-blacknew">
                                {t("Edit")}
                              </span>
                            </Button>
                          )}
                          {hasMilestoneDeletePermission && (
                            <Button
                              onClick={() => handleDelete(milestone._id)}
                              className="text-red-500"
                              size="small"
                            >
                              <FaTrash className="text-black-blacknew" />
                              <span className="mx-2 items-center flex text-black-blacknew">
                                {t("Delete")}
                              </span>
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <Pagination
            count={totalPages}
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

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyles}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">
              {editData ? t("Edit_Milestone") : t("Add_Additional_Milestone")}
            </Typography>
            <IconButton onClick={handleClose}>
              <RiCloseLine />
            </IconButton>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextField
              label={t("Title")}
              variant="outlined"
              fullWidth
              placeholder={t("Title")}
              value={formData?.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
            <TextField
              label={t("Description")}
              variant="outlined"
              fullWidth
              placeholder={t("Description")}
              value={formData?.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>{t("Status")}</InputLabel>
              <Select
                label={t("Status")}
                value={formData?.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                required
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            {formData.status === "completed" && (
              <TextField
                label={t("Completed_At")}
                variant="outlined"
                fullWidth
                type="datetime-local"
                value={
                  formData.completedAt
                    ? new Date(formData.completedAt).toISOString().slice(0, 16)
                    : new Date().toISOString().slice(0, 16)
                }
                onChange={(e) =>
                  setFormData({ ...formData, completedAt: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}

            <div className="relative">
              {!editData && (
                <div
                  className="mt-2 border border-gray-300 rounded-md p-2 w-full py-4 cursor-pointer"
                  onClick={() =>
                    setIsProjectDropdownOpen(!isProjectDropdownOpen)
                  }
                >
                  {formData.projectName || t("Select_a_Project")}
                </div>
              )}
              {isProjectDropdownOpen && !editData && (
                <div className="absolute overflow-auto z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="p-2 border-b border-gray-300 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {loading ? (
                      <div className="p-2">Loading...</div>
                    ) : filteredProjects.length > 0 ? (
                      filteredProjects.map((project) => (
                        <div
                          key={project._id}
                          className={`p-2 hover:bg-gray-100 cursor-pointer ${
                            formData.projectId === project._id
                              ? "bg-gray-200"
                              : ""
                          }`}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              projectName: project.projectName,
                              projectId: project._id,
                            });
                            setSearchTerm("");
                            setIsProjectDropdownOpen(false);
                          }}
                        >
                          {project.projectName}
                        </div>
                      ))
                    ) : (
                      <div className="p-2">No projects found.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="contained"
                type="submit"
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#333333" },
                }}
              >
                {editData ? t("Update") : t("Save")}
              </Button>
              <Button
                sx={{
                  backgroundColor: "#E9E9E9",
                  color: "black",
                }}
                onClick={handleClose}
              >
                {t("Close")}
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default MilestoneTable;
