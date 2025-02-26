import React, { useState, useEffect, useRef } from "react";
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

const Documents = () => {
  const [openStates, setOpenStates] = useState({});
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projecto, setProjecto] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state?.auth?.userToken);
  const user = useSelector((state) => state?.auth?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalRef = useRef(null);

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

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("get", "/userdocuments", {}, token);
      if (response?.status === 200) {
        setProjects(response?.data || []);
        console.log(response?.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token, page]);

  useEffect(() => {
    const fetchProjecto = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/projects", {}, token);
        if (response?.data?.statusCode === 200) {
          setProjecto(response?.data?.data?.projects || []);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjecto();
  }, [token]);

  const handleOpen = () => {
    navigate("/submitDocument");
  };

  const handleOpens = (user) => {
    setEditData(user);
    setOpen(true); // Ensure modal opens
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
    setSelectedProject(""); // Reset project name
    setSelectedFile(null);
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
      !formData.userName.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim()
    ) {
      toast.error("All fields are required.");
      return;
    }
    try {
      if (!token) {
        throw new Error("No token found");
      }
      const response = await apiRequest("post", "/clients", formData, token);

      if (response.data.statusCode === 201) {
        toast.success(response.data.message);
        fetchProjects();
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
      await apiRequest("delete", `/userdocuments/${userId}`, {}, token);
      toast.success("User deleted successfully.");
      fetchProjects();
    } catch (error) {
      toast.error("Failed to delete user.");
      console.error("Error:", error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("projName", selectedProject);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      await apiRequest(
        "patch",
        `/userdocuments/${editData._id}`,
        formData,
        token,
        {
          "Content-Type": "multipart/form-data",
        }
      );

      toast.success("User updated successfully.");
      fetchProjects();
      handleClose();
    } catch (error) {
      toast.error("Failed to update user.");
      console.error("Error:", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed!");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedProject) {
      toast.info("Please select a project and upload a PDF file.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("projName", selectedProject);
    formData.append("user", user);

    try {
      const response = await apiRequest("post", "/documents", formData, token, {
        "Content-Type": "multipart/form-data",
      });
      console.log(response);

      if (response?.status === 200 || response?.status === 201) {
        toast.success("File uploaded successfully!");
        setSelectedFile(null);
        setSelectedProject("");

        navigate("/userReports");
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred while uploading.");
    } finally {
      setUploading(false);
    }
  };

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
    "ClientsManagement",
    "create"
  );
  const hasCLientUpdatePermission = RolePermissions(
    "ClientsManagement",
    "update"
  );
  const hasCLientDeletePermission = RolePermissions(
    "ClientsManagement",
    "delete"
  );

  const { t } = useTranslation();

  console.log("projects", projects);

  return (
    <>
      <div className="mx-5">
        <div className="flex justify-between items-center mb-4 mx-5">
          <h2 className="text-xl font-semibold">{t("All_Users")}</h2>
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
              + {t("Upload_New_Document")}
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
                <th className="p-4 border-b">{t("Document_Name")}</th>
                <th className="p-4 border-b">{t("Project_Name")}</th>
                <th className="p-4 border-b">{t("Uploaded_By")}</th>
                <th className="p-4 border-b">{t("Uploaded_At")}</th>
                <th className="p-4 border-b">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((user, idx) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <Checkbox />
                  </td>
                  <td className="p-4">{user.fileName}</td>
                  <td className="p-4">{user.projName}</td>
                  <td className="p-4">{user.user}</td>
                  <td className="p-4">{user.uploadedAt}</td>
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
                              onClick={() => handleOpens(user)}
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
            <Typography className="font-semibold text-lg">
              {t("Document_Details")}
            </Typography>
            <IconButton onClick={handleClose}>
              <RiCloseLine />
            </IconButton>
          </div>

          <select
            className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
            value={selectedProject || editData?.projName || ""}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">{t("Select_a_project")}</option>
            {loading ? (
              <option>Loading...</option>
            ) : (
              projecto.map((project) => (
                <option key={project._id} value={project.projectName}>
                  {project.projectName}{" "}
                </option>
              ))
            )}
          </select>

          <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
            <div className="flex justify-between items-center border border-gray-300 rounded-md p-2">
              <Typography className="text-gray-700">
                {selectedFile
                  ? selectedFile.name
                  : editData?.fileName || "No file selected"}
              </Typography>
              <button
                type="button"
                className="bg-[#F9F9F9] text-[#1A1A18] text-[14px] font-[500] border px-4 py-2 rounded-md"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {t("Upload_Files")}
              </button>
              <input
                type="file"
                id="fileInput"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
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
                  "&:hover": { backgroundColor: "#d1d1d1" },
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

export default Documents;
