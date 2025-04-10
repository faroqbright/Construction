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
import { Milestone } from "lucide-react";

const MilestoneTable = () => {
  const [openStates, setOpenStates] = useState({});
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState();
  const [selectedProject, setSelectedProject] = useState("");
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
  console.log("User ID:", _id);
  

  const filteredProjects = projects.filter(project =>
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

  const fetchUsers = useCallback(async () => {
    try {
      const response = await apiRequest("get", `/additional/user/${_id}`, {}, token);
      console.log(response);
      if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.success("You have been logged out.");
        navigate("/login");
      } else {
        console.error("Error:", error);
      }
    }
  }, [token, dispatch, navigate, page]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/projects", {}, token);
        if (response?.data?.statusCode === 200) {
          setProjects(response?.data?.data?.projects || []);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleOpen = (user = null) => {
    setEditData(user);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        number: user.number,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        number: "",
      });
    }
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
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.number.trim()
    ) {
      toast.error("All fields are required.");
      return;
    }
    try {
      if (!token) {
        throw new Error("No token found");
      }
      const response = await apiRequest("post", `/additional/milestone/${}`, formData, token);

      if (response.data.statusCode === 201) {
        toast.success(response.data.message);
        fetchUsers();
        handleClose();
      } else {
        toast.error("Failed to add user.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
      console.error("Error:", error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await apiRequest("delete", `/companies/${userId}`, {}, token);
      toast.success("Company deleted successfully.");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user.");
      console.error("Error:", error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        name: formData.name,
        email: formData.email,
        number: formData.number,
      };
      await apiRequest(
        "patch",
        `/companies/${editData._id}`,
        updatedData,
        token
      );

      toast.success("Comapny updated successfully.");
      fetchUsers();
      handleClose();
    } catch (error) {
      toast.error("Failed to update user.");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const hasCLientCreatePermission = RolePermissions(
    "CompanyManagement",
    "create"
  );
  const hasCLientUpdatePermission = RolePermissions(
    "CompanyManagement",
    "update"
  );
  const hasCLientDeletePermission = RolePermissions(
    "CompanyManagement",
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
          {hasCLientCreatePermission && (
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
                  <Checkbox />
                </th>

                <th className="p-4 border-b">{t("Title")}</th>
                <th className="p-4 border-b">{t("Description")}</th>
                <th className="p-4 border-b">{t("Completed_At")}</th>
                <th className="p-4 border-b">{t("Created_At")}</th>
                <th className="p-4 border-b">{t("Status")}</th>
                {(hasCLientUpdatePermission || hasCLientDeletePermission) && (
                  <th className="p-4 border-b">{t("Actions")}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <Checkbox />
                  </td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.number}</td>
                  <td className="p-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded ${
                        user.status === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  {(hasCLientUpdatePermission || hasCLientDeletePermission) && (
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
                          {hasCLientUpdatePermission && (
                            <Button
                              onClick={() => handleOpen(user)}
                              size="small"
                            >
                              <FaEdit className="text-black-blacknew" />
                              <span className="mx-3 items-center flex text-black-blacknew">
                                {t("Edit")}
                              </span>
                            </Button>
                          )}
                          {hasCLientDeletePermission && (
                            <Button
                              onClick={() => handleDelete(user._id)}
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
              value={formData?.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              label={t("Description")}
              variant="outlined"
              fullWidth
              placeholder={t("Description")}
              value={formData?.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <TextField
              label={t("Status")}
              variant="outlined"
              fullWidth
              placeholder={t("Status")}
              value={formData?.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
            />

            {/* Project Selection Dropdown with Search */}
            <div className="relative">
              <div 
                className="mt-2 border border-gray-300 rounded-md p-2 w-full py-4 cursor-pointer"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              >
                {selectedProject || t("Select_a_Project")}
              </div>
              {isProjectDropdownOpen && (
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
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedProject(project.projectName);
                            setFormData({ ...formData, projectName: project.projectName });
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